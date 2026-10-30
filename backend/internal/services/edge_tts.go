package services

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/binary"
	"encoding/hex"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"
	"unicode"

	"github.com/gorilla/websocket"
)

// Edge TTS endpoint and protocol constants. The endpoint and version are
// pinned to a Chromium release that the service still accepts.
const (
	edgeEndpoint        = "wss://api.msedgeservices.com/tts/cognitiveservices/websocket/v1"
	edgeTrustedToken    = "6A5AA1D4EAFF4E9FB37E23D68491D6F4"
	edgeChromiumVersion = "140.0.3485.14"
	edgeOutputFormat    = "audio-24khz-48kbitrate-mono-mp3"
	edgeRetryDelay      = 500 * time.Millisecond
	windowsEpochOffset  = 11644473600
)

// Synthesizer converts text into MP3 bytes using one neural voice.
type Synthesizer interface {
	Synthesize(ctx context.Context, text, voice string) ([]byte, error)
}

// EdgeTTS is a minimal native Edge TTS client. It speaks the same WebSocket
// protocol as the official Edge Read Aloud feature, so no API key is needed.
type EdgeTTS struct {
	timeout time.Duration
	dialer  *websocket.Dialer
}

// NewEdgeTTS creates a client with a per-attempt synthesis timeout.
func NewEdgeTTS(timeout time.Duration) *EdgeTTS {
	return &EdgeTTS{
		timeout: timeout,
		dialer: &websocket.Dialer{
			HandshakeTimeout: timeout,
			Subprotocols:     []string{"synthesize"},
		},
	}
}

// Synthesize converts text into MP3 audio. It retries once because the Edge
// service occasionally drops a connection before returning any audio.
func (e *EdgeTTS) Synthesize(ctx context.Context, text, voice string) ([]byte, error) {
	text = sanitizeTTSText(text)
	if text == "" {
		return nil, fmt.Errorf("text is empty")
	}
	if strings.TrimSpace(voice) == "" {
		return nil, fmt.Errorf("voice is empty")
	}

	audio, err := e.synthesizeOnce(ctx, text, voice)
	if err == nil {
		return audio, nil
	}
	if ctx.Err() != nil {
		return nil, ctx.Err()
	}

	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	case <-time.After(edgeRetryDelay):
	}

	return e.synthesizeOnce(ctx, text, voice)
}

func (e *EdgeTTS) synthesizeOnce(ctx context.Context, text, voice string) ([]byte, error) {
	requestCtx, cancel := context.WithTimeout(ctx, e.timeout)
	defer cancel()

	requestID := randomHex(16)
	conn, _, err := e.dialer.DialContext(requestCtx, e.endpointURL(), edgeHeaders())
	if err != nil {
		return nil, fmt.Errorf("connect to edge tts: %w", err)
	}
	defer conn.Close()

	deadline, ok := requestCtx.Deadline()
	if ok {
		if err := conn.SetWriteDeadline(deadline); err != nil {
			return nil, fmt.Errorf("set edge tts write deadline: %w", err)
		}
		if err := conn.SetReadDeadline(deadline); err != nil {
			return nil, fmt.Errorf("set edge tts read deadline: %w", err)
		}
	}

	if err := conn.WriteMessage(websocket.TextMessage, speechConfigFrame()); err != nil {
		return nil, fmt.Errorf("send speech config: %w", err)
	}
	if err := conn.WriteMessage(websocket.TextMessage, ssmlFrame(requestID, text, voice)); err != nil {
		return nil, fmt.Errorf("send ssml: %w", err)
	}

	var audio []byte
	for {
		messageType, payload, err := conn.ReadMessage()
		if err != nil {
			return nil, fmt.Errorf("read edge tts response: %w", err)
		}

		switch messageType {
		case websocket.TextMessage:
			if strings.Contains(string(payload), "Path:turn.end") {
				if len(audio) == 0 {
					return nil, fmt.Errorf("edge tts returned no audio")
				}
				return audio, nil
			}
		case websocket.BinaryMessage:
			chunk, err := parseAudioFrame(payload)
			if err != nil {
				return nil, err
			}
			audio = append(audio, chunk...)
		}
	}
}

func (e *EdgeTTS) endpointURL() string {
	values := url.Values{}
	values.Set("Ocp-Apim-Subscription-Key", edgeTrustedToken)
	values.Set("ConnectionId", randomHex(16))
	values.Set("Sec-MS-GEC", secMsGecToken())
	values.Set("Sec-MS-GEC-Version", "1-"+edgeChromiumVersion)
	return edgeEndpoint + "?" + values.Encode()
}

func edgeHeaders() http.Header {
	majorVersion := strings.SplitN(edgeChromiumVersion, ".", 2)[0]
	headers := http.Header{}
	headers.Set("Pragma", "no-cache")
	headers.Set("Cache-Control", "no-cache")
	headers.Set("Origin", "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold")
	headers.Set("User-Agent", fmt.Sprintf(
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s.0.0.0 Safari/537.36 Edg/%s.0.0.0",
		majorVersion,
		majorVersion,
	))
	headers.Set("Accept-Encoding", "gzip, deflate, br")
	headers.Set("Accept-Language", "en-US,en;q=0.9")
	headers.Set("Cookie", "muid="+strings.ToUpper(randomHex(16))+";")
	return headers
}

func speechConfigFrame() []byte {
	config := `{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"` + edgeOutputFormat + `"}}}}`
	return []byte(
		"X-Timestamp:" + edgeTimestamp() + "\r\n" +
			"Content-Type:application/json; charset=utf-8\r\n" +
			"Path:speech.config\r\n\r\n" +
			config + "\r\n",
	)
}

func ssmlFrame(requestID, text, voice string) []byte {
	ssml := fmt.Sprintf(
		`<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="%s"><prosody pitch="+0Hz" rate="+0%%" volume="+0%%">%s</prosody></voice></speak>`,
		xmlEscape(voice),
		xmlEscape(text),
	)
	return []byte(
		"X-RequestId:" + requestID + "\r\n" +
			"Content-Type:application/ssml+xml\r\n" +
			"X-Timestamp:" + edgeTimestamp() + "Z\r\n" +
			"Path:ssml\r\n\r\n" +
			ssml,
	)
}

// parseAudioFrame returns the audio part of a binary frame. Every frame starts
// with a big-endian header length, the text header, then the audio payload.
func parseAudioFrame(payload []byte) ([]byte, error) {
	if len(payload) < 2 {
		return nil, fmt.Errorf("edge tts sent a truncated audio frame")
	}

	headerLength := int(binary.BigEndian.Uint16(payload[:2]))
	if len(payload) < 2+headerLength {
		return nil, fmt.Errorf("edge tts sent an invalid audio header")
	}

	header := string(payload[2 : 2+headerLength])
	if !strings.Contains(header, "Path:audio") {
		return nil, nil
	}
	return payload[2+headerLength:], nil
}

// secMsGecToken follows the Windows file-time based token used by Edge.
func secMsGecToken() string {
	ticks := (time.Now().UTC().Unix() + windowsEpochOffset) * 10_000_000
	ticks -= ticks % 3_000_000_000
	sum := sha256.Sum256([]byte(fmt.Sprintf("%d%s", ticks, edgeTrustedToken)))
	return strings.ToUpper(hex.EncodeToString(sum[:]))
}

func edgeTimestamp() string {
	return time.Now().UTC().Format("Mon Jan 02 2006 15:04:05 GMT+0000 (Coordinated Universal Time)")
}

func xmlEscape(value string) string {
	replacer := strings.NewReplacer(
		"&", "&amp;",
		"<", "&lt;",
		">", "&gt;",
		`"`, "&quot;",
		"'", "&apos;",
	)
	return replacer.Replace(value)
}

// sanitizeTTSText removes control characters that the service rejects.
func sanitizeTTSText(text string) string {
	cleaned := strings.Map(func(r rune) rune {
		if r == '\n' || r == '\r' || r == '\t' {
			return ' '
		}
		if unicode.IsControl(r) {
			return -1
		}
		return r
	}, text)
	return strings.TrimSpace(cleaned)
}

func randomHex(bytes int) string {
	buf := make([]byte, bytes)
	if _, err := rand.Read(buf); err != nil {
		// The values are only identifiers, so a timestamp fallback is enough.
		return fmt.Sprintf("%x", time.Now().UnixNano())
	}
	return hex.EncodeToString(buf)
}

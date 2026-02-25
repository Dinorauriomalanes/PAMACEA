using Microsoft.AspNetCore.Mvc;
using PAMACEA.Services;

namespace PAMACEA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GeminiController : ControllerBase
    {
        private readonly GeminiService _geminiService;

        public GeminiController(GeminiService geminiService)
        {
            _geminiService = geminiService;
        }

        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] ChatRequest request)
        {
            Console.WriteLine($"[proxy] Chat request received: {request?.Message?.Substring(0, Math.Min(request.Message.Length, 20))}...");
            try
            {
                var response = await _geminiService.GenerateContentAsync(request.Message);
                Console.WriteLine("[proxy] Chat response generated successfully");
                return Ok(new { response });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[proxy] Chat error: {ex.Message}");
                return StatusCode(500, ex.Message);
            }
        }


        [HttpPost("tts")]
        public async Task<IActionResult> TTS([FromBody] TtsRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request?.Text))
                    return BadRequest("Text is required");

                var audioBytes = await _geminiService.GenerateSpeechAsync(request.Text);

                if (audioBytes == null || audioBytes.Length == 0)
                    return BadRequest("No audio generated");

                var fileName = $"sofia_{Guid.NewGuid()}.mp3";
                var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/audio");

                if (!Directory.Exists(folderPath))
                    Directory.CreateDirectory(folderPath);

                var filePath = Path.Combine(folderPath, fileName);

                await System.IO.File.WriteAllBytesAsync(filePath, audioBytes);

                var fileUrl = $"/audio/{fileName}";

                Console.WriteLine($"[proxy] TTS file generated: {fileName}");

                return Ok(new { url = fileUrl });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[proxy] TTS error: {ex.Message}");
                return StatusCode(500, ex.Message);
            }
        }
    }

    public class TtsRequest
    {
        public string Text { get; set; }
    }

    public class ChatRequest
    {
        public string Message { get; set; }
    }
}

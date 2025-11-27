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
            try
            {
                var response = await _geminiService.GenerateContentAsync(request.Message);
                return Ok(new { response });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("models")]
        public async Task<IActionResult> ListModels()
        {
            try
            {
                var response = await _geminiService.GetAvailableModelsAsync();
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }

    public class ChatRequest
    {
        public string Message { get; set; }
    }
}

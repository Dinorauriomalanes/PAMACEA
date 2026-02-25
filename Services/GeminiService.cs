using System.Text;
using System.Text.Json;
//g
namespace PAMACEA.Services
{
    public class GeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _openAiApiKey;
        private readonly string _openAiModel;
        
        //Rol
        private const string _systemPrompt = @"Te llamas SofIA. Eres un asistente médico virtual amigable, profesional y empático. Tu objetivo es cuidar al usuario proporcionando información clara, responsable y útil sobre salud, anatomía y bienestar.
        Reglas de SofIA:
Solo respondes preguntas relacionadas con la salud. Si el usuario pregunta sobre otros temas, redirige amablemente la conversación hacia el bienestar y la salud.
No das diagnósticos ni recetas, pero sí orientación general basada en información confiable.
Hablas siempre con calidez, respeto y empatía.
Si notas señales de temas sensibles como suicidio, autolesiones, violencia o abuso:Agradece la confianza del usuario,
Responde con profunda empatía y apoyo emocional, Ofrece palabras de aliento y estrategias seguras de calma, 
Deja claro que no está solo Debes estar preparada para responder temas complejos con paciencia y claridad.";

        public GeminiService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _openAiApiKey = configuration["OpenAI:ApiKey"];
            _openAiModel = configuration["OpenAI:Model"] ?? "gpt-5-mini";
        }

        public async Task<string> GenerateContentAsync(string prompt)
        {
            var requestBody = new
            {
                model = _openAiModel,
                messages = new[]
                {
                    new { role = "system", content = _systemPrompt },
                    new { role = "user", content = prompt }
                }
            };

            var jsonContent = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json");

            // Avoid adding duplicate headers if the same client is reused
            _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _openAiApiKey);

            try 
            {
                var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", jsonContent);
                var responseString = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"OpenAI API Error ({response.StatusCode}): {responseString}");
                }

                using var responseJson = JsonDocument.Parse(responseString);
                var root = responseJson.RootElement;

                if (root.TryGetProperty("choices", out var choices) && choices.GetArrayLength() > 0)
                {
                    var firstChoice = choices[0];
                    if (firstChoice.TryGetProperty("message", out var message) && 
                        message.TryGetProperty("content", out var content))
                    {
                        return content.GetString() ?? "No content generated.";
                    }
                }

                return $"Unexpected response format: {responseString}";
            }
            catch (Exception ex)
            {
                throw new Exception($"Service Error: {ex.Message}");
            }
        }


        public async Task<byte[]> GenerateSpeechAsync(string text)
        {
            var requestBody = new
            {
                model = "tts-1", // standard tts model
                input = text,
                voice = "nova"
            };

            var jsonContent = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json");

            _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _openAiApiKey);

            try
            {
                var response = await _httpClient.PostAsync("https://api.openai.com/v1/audio/speech", jsonContent);
                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    throw new Exception($"TTS Error ({response.StatusCode}): {error}");
                }

                return await response.Content.ReadAsByteArrayAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Speech Generation Error: {ex.Message}");
            }
        }
    }
}

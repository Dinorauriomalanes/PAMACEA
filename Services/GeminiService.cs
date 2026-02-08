using System.Text;
using System.Text.Json;
//g
namespace PAMACEA.Services
{
    public class GeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _baseUrl;
        
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
            _apiKey = configuration["Gemini:ApiKey"];
            _baseUrl = configuration["Gemini:BaseUrl"];
        }

        public async Task<string> GenerateContentAsync(string prompt)
        {
            // Combine system prompt with user prompt
            var fullPrompt = $"{_systemPrompt}\n\nUsuario: {prompt}";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = fullPrompt }
                        }
                    }
                }
            };

            var jsonContent = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json");

            var url = $"{_baseUrl}?key={_apiKey}";

            try 
            {
                var response = await _httpClient.PostAsync(url, jsonContent);
                var responseString = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    // Log this error or throw with detailed message
                    throw new Exception($"Gemini API Error ({response.StatusCode}): {responseString}");
                }

                using var responseJson = JsonDocument.Parse(responseString);
                var root = responseJson.RootElement;

                // Check if we have candidates
                if (root.TryGetProperty("candidates", out var candidates) && candidates.GetArrayLength() > 0)
                {
                    var firstCandidate = candidates[0];
                    
                    // Check for content
                    if (firstCandidate.TryGetProperty("content", out var content) && 
                        content.TryGetProperty("parts", out var parts) && 
                        parts.GetArrayLength() > 0)
                    {
                        return parts[0].GetProperty("text").GetString() ?? "No text generated.";
                    }
                    
                    // Check for finishReason if no content
                    if (firstCandidate.TryGetProperty("finishReason", out var finishReason))
                    {
                        return $"No response generated. Reason: {finishReason.GetString()}";
                    }
                }

                return $"Unexpected response format: {responseString}";
            }
            catch (Exception ex)
            {
                // This will be caught by the controller
                throw new Exception($"Service Error: {ex.Message}");
            }
        }

        public async Task<string> GetAvailableModelsAsync()
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models?key={_apiKey}";
            var response = await _httpClient.GetAsync(url);
            return await response.Content.ReadAsStringAsync();
        }
    }
}

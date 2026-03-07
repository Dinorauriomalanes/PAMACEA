using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using ProyectoPamacea.Models;
using ProyectoPamacea.ViewModels;

namespace ProyectoPamacea.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;

    public HomeController(ILogger<HomeController> logger)
    {
        _logger = logger;
    }

    public IActionResult Index()
    {
        return View();
    }

    public IActionResult Chat()
    {
        return View();
    }

    public IActionResult Enfermedades()
    {
        int mesActual = DateTime.Now.Month;
        int diaActual = DateTime.Now.Day;

        string estacion;

        if ((mesActual == 12 && diaActual >= 21) || mesActual == 1 || mesActual == 2 || (mesActual == 3 && diaActual <= 19))
        {
            estacion = "Invierno";
        }
        else if ((mesActual == 3 && diaActual >= 20) || mesActual == 4 || mesActual == 5 || (mesActual == 6 && diaActual <= 20))
        {
            estacion = "Primavera";
        }
        else if ((mesActual == 6 && diaActual >= 21) || mesActual == 7 || mesActual == 8 || (mesActual == 9 && diaActual <= 22))
        {
            estacion = "Verano";
        }
        else
        {
            estacion = "Otoño";
        }

        var modelo = new EnfermedadViewModel
        {
            Estacion = estacion
        };

        return View(modelo);
    }
    public IActionResult Anatomia()
    {
        return View();
    }

    public IActionResult SaludMental()
    {
        return View();
    }

    public IActionResult Ayuda()
    {
        return View();
    }

    public IActionResult AcercaDe()
    {
        return View();
    }

    public IActionResult LineaDeVida()
    {
        return View();
    }

    public IActionResult ProgramaVerificados()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}

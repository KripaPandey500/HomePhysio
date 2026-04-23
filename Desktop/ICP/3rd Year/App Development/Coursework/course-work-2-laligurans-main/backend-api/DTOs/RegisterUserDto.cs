using System.ComponentModel.DataAnnotations;

namespace WeatherAPI.DTOs;

public class RegisterUserDto
{
    [Required]
    public string FirstName { get; set; }
    [Required]
    public string LastName { get; set; }
    [Required]
    [EmailAddress]
    public string Email { get; set; }
    [Required]
    public string Password { get; set; }
    public string? Phone { get; set; }
    public string? ProfilePicture { get; set; }
    public string? Address { get; set; }

    public string? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }
}

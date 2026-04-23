using System.ComponentModel.DataAnnotations;

namespace WeatherAPI.DTOs;

public class CreateUserDto
{
    [Required]
    public string FirstName { get; set; }
    [Required]
    public string LastName { get; set; }
    [Required]
    [EmailAddress]
    public string Email { get; set; }
    public string? Phone { get; set; }
    public string? ProfilePicture { get; set; }
    public string? Address { get; set; }
    public string? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string Role { get; set; } = "User";
}

public class UpdateUserDto
{
    [Required]
    public string FirstName { get; set; }
    [Required]
    public string LastName { get; set; }
    [Required]
    [EmailAddress]
    public string Email { get; set; }
    public string? Phone { get; set; }
    public string? ProfilePicture { get; set; }
    public string? Address { get; set; }
    public string? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string Role { get; set; } = "User";
}

public class UserDto
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Phone { get; set; }
    public string? ProfilePicture { get; set; }
    public string? Address { get; set; }
    public string Role { get; set; }
}

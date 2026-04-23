public class User
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
	public string? Phone { get; set; }

	public string? ProfilePicture { get; set; }

    // Gender: Male, Female, Other
    public string? Gender { get; set; }

    // Date of Birth
    public DateTime? DateOfBirth { get; set; }

    // User address
    public string? Address { get; set; }

    public string Role { get; set; }

    public string IdentityUserId { get; set; } // Link to IdentityUser

    // One User has many Orders (1-to-M)
    public ICollection<Order> Orders { get; set; }

    public ICollection<Booking> Bookings { get; set; }
    public ICollection<Review> Reviews { get; set; }
}

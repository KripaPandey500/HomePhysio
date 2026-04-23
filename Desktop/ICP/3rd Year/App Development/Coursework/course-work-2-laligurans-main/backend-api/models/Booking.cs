public class Booking
{
    public int Id { get; set; }
    public DateTime BookingDate { get; set; }
    public string Status { get; set; } // e.g., Pending, Confirmed, Cancelled

    // Many Bookings belong to one User (M-to-1)
    public int UserId { get; set; }
    public User User { get; set; }

    // Many Bookings can be for one Product (M-to-1)
    public int ProductId { get; set; }
    public Product Product { get; set; }
}

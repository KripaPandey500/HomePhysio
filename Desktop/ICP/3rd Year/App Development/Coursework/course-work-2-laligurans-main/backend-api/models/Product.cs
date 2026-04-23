public class Product
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string SKU { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }          
    public decimal? Discount { get; set; }      
    public int StockQty { get; set; }
    public string Brand { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime? UpdatedAt { get; set; }

    // 🔹 Category (organization)
    public int CategoryId { get; set; }
    public Category Category { get; set; }

    // One Product can appear in many OrderItems (1-to-M)
    public ICollection<OrderItem> OrderItems { get; set; }
    // Many Products belong to one Vendor (M-to-1)
    public int VendorId { get; set; }
    public Vendor Vendor { get; set; }

    // Navigation property for Bookings
    public ICollection<Booking> Bookings { get; set; }

    // Navigation property for Reviews
    public ICollection<Review> Reviews { get; set; }
}

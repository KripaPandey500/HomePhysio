public class Vendor
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string? Phone { get; set; }
    // One Vendor supplies many Products (1-to-M)
    public List<Product> Products { get; set; } = new();
}

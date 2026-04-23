using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

using Microsoft.AspNetCore.Identity;
public class AppDbContext : IdentityDbContext<IdentityUser, IdentityRole, string>
{
    //Add constructor to accept DbContextOptions 
    //This allows configuration to be passed in from Program.cs when registering the DbContext 
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Category> Categories { get; set; }
    public DbSet<Vendor> Vendors { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<Booking> Bookings { get; set; }

    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<VehiclePart> VehicleParts { get; set; }
    public DbSet<Purchase> Purchases { get; set; }
    public DbSet<Report> Reports { get; set; }
    public DbSet<Review> Reviews { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Vendor - Product (1-M)
        modelBuilder.Entity<Vendor>()
            .HasMany(v => v.Products)
            .WithOne(p => p.Vendor)
            .HasForeignKey(p => p.VendorId)
            .OnDelete(DeleteBehavior.Restrict);

        // Composite Key: OrderItem
        modelBuilder.Entity<OrderItem>()
            .HasKey(oi => new { oi.OrderId, oi.ProductId });

        // Configure relationships

        // Category - Product (1-M)
        modelBuilder.Entity<Category>()
            .HasMany(c => c.Products)
            .WithOne(p => p.Category)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Vendor - Product (1-M)
        modelBuilder.Entity<Vendor>()
            .HasMany(v => v.Products)
            .WithOne(p => p.Vendor)
            .HasForeignKey(p => p.VendorId)
            .OnDelete(DeleteBehavior.Restrict);
        // User - Order (1-M)
        modelBuilder.Entity<User>()
            .HasMany(u => u.Orders)
            .WithOne(o => o.User)
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Order - OrderItem (1-M)
        modelBuilder.Entity<Order>()
            .HasMany(o => o.OrderItems)
            .WithOne(oi => oi.Order)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        // Product - OrderItem (1-M)
        modelBuilder.Entity<Product>()
            .HasMany(p => p.OrderItems)
            .WithOne(oi => oi.Product)
            .HasForeignKey(oi => oi.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        // Product - Review (1-M)
        modelBuilder.Entity<Product>()
            .HasMany(p => p.Reviews)
            .WithOne(r => r.Product)
            .HasForeignKey(r => r.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        // User - Review (1-M)
        modelBuilder.Entity<User>()
            .HasMany(u => u.Reviews)
            .WithOne(r => r.User)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Product - Booking (1-M)
        modelBuilder.Entity<Product>()
            .HasMany(p => p.Bookings)
            .WithOne(b => b.Product)
            .HasForeignKey(b => b.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        // User - Booking (1-M)
        modelBuilder.Entity<User>()
            .HasMany(u => u.Bookings)
            .WithOne(b => b.User)
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

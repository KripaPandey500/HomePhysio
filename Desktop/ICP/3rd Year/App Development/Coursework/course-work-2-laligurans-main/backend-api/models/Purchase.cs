public class Purchase
{
   public int Id { get; set; }
   public DateTime PurchaseDate { get; set; }
   public decimal TotalAmount { get; set; }

   // Many Purchases belong to one User (M-to-1)
   public int UserId { get; set; }
   public User User { get; set; }

   // One Purchase has many PurchaseItems (1-to-M)
   public ICollection<PurchaseItem> PurchaseItems { get; set; }
}
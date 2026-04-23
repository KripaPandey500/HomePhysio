public class Review
{
   public int Id { get; set; }
   public int Rating { get; set; }  // 1 to 5
   public string Comment { get; set; }

   // Many Reviews belong to one Product (M-to-1)
   public int ProductId { get; set; }
   public Product Product { get; set; }

   // Many Reviews belong to one User (M-to-1)
   public int UserId { get; set; }
   public User User { get; set; }
}
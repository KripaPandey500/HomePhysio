public class Report
{
   public int Id { get; set; }
   public string Title { get; set; }
   public string Description { get; set; }
   public DateTime CreatedAt { get; set; }

   // Many Reports belong to one User (M-to-1)
   public int UserId { get; set; }
   public User User { get; set; }
}
public class RegisterDto

{

    public string Email    { get; set; }

    public string Password { get; set; }

}

 

public class LoginDto

{

    public string Email    { get; set; }

    public string Password { get; set; }

}

public class ChangePasswordDto
{
    public string Email { get; set; }
    public string OldPassword { get; set; }
    public string NewPassword { get; set; }
}

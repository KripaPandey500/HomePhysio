using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WeatherAPI.DTOs;
using Microsoft.VisualBasic;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    // UserManager is responsible for managing users in the system.
    // It handles:
    // - Creating users
    // - Deleting users
    // - Finding users
    // - Updating user info
    // - Assigning roles
    // - Managing passwords (hashing, reset, etc.)
    private readonly UserManager<IdentityUser> _userManager;

    // SignInManager is responsible for authentication (login process).
    // It handles:
    // - Checking username/email + password
    // - Signing users in and out
    // - Managing login sessions (cookies in MVC apps)
    // - Security features like lockout and 2FA
    private readonly SignInManager<IdentityUser> _signInManager;

    // AppDbContext is responsible for storing user data.
    private readonly AppDbContext _context;

    public AuthController(
        UserManager<IdentityUser> userManager,
        SignInManager<IdentityUser> signInManager,
        AppDbContext context)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _context = context;
    }

    // POST api/auth/register-staff
    [HttpPost("register-staff")]
    public async Task<IActionResult> RegisterStaff([FromForm] RegisterUserDto model, [FromForm] IFormFile profilePicture)
    {
        var existingUser = await _userManager.FindByEmailAsync(model.Email);
        if (existingUser != null)
            return BadRequest(new[] { new { description = "Email is already registered." } });

        string profilePicPath = null;
        if (profilePicture != null && profilePicture.Length > 0)
        {
            var uploadsFolder = Path.Combine("assets", "uploads", "users");
            Directory.CreateDirectory(uploadsFolder);
            var fileName = Guid.NewGuid() + Path.GetExtension(profilePicture.FileName);
            var filePath = Path.Combine(uploadsFolder, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await profilePicture.CopyToAsync(stream);
            }
            profilePicPath = $"/assets/uploads/users/{fileName}";
        }

        var identityUser = new IdentityUser { UserName = model.Email, Email = model.Email };
        var result = await _userManager.CreateAsync(identityUser, model.Password);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        await _userManager.AddToRoleAsync(identityUser, "STAFF");

        var user = new User
        {
            FirstName = model.FirstName,
            LastName = model.LastName,
            Email = model.Email,
            Phone = model.Phone,
            ProfilePicture = profilePicPath,
            Address = model.Address,
            Gender = model.Gender,
            DateOfBirth = model.DateOfBirth,
            Role = "STAFF",
            IdentityUserId = identityUser.Id
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok("Staff registered successfully.");
    }


    // POST api/auth/register-vendor
    [HttpPost("register-vendor")]
    public async Task<IActionResult> RegisterVendor([FromForm] RegisterUserDto model, [FromForm] IFormFile profilePicture)
    {
        var existingUser = await _userManager.FindByEmailAsync(model.Email);
        if (existingUser != null)
            return BadRequest(new[] { new { description = "Email is already registered." } });

        string profilePicPath = null;
        if (profilePicture != null && profilePicture.Length > 0)
        {
            var uploadsFolder = Path.Combine("assets", "uploads", "users");
            Directory.CreateDirectory(uploadsFolder);
            var fileName = Guid.NewGuid() + Path.GetExtension(profilePicture.FileName);
            var filePath = Path.Combine(uploadsFolder, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await profilePicture.CopyToAsync(stream);
            }
            profilePicPath = $"/assets/uploads/users/{fileName}";
        }

        // Create IdentityUser for authentication
        var identityUser = new IdentityUser { UserName = model.Email, Email = model.Email };
        var result = await _userManager.CreateAsync(identityUser, model.Password);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        await _userManager.AddToRoleAsync(identityUser, "VENDOR");

        // Create User entity for vendor profile
        var user = new User
        {
            FirstName = model.FirstName,
            LastName = model.LastName,
            Email = model.Email,
            Phone = model.Phone,
            ProfilePicture = profilePicPath,
            Address = model.Address,
            Gender = model.Gender,
            DateOfBirth = model.DateOfBirth,
            Role = "Vendor",
            IdentityUserId = identityUser.Id
        };

        // Save to AppDbContext
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok("Vendor registered successfully.");
    }

    // POST api/auth/register-admin
    [HttpPost("register-admin")]
    public async Task<IActionResult> RegisterAdmin([FromBody] RegisterDto model)
    {
        var identityUser = new IdentityUser { UserName = model.Email, Email = model.Email };
        var result = await _userManager.CreateAsync(identityUser, model.Password);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        await _userManager.AddToRoleAsync(identityUser, "ADMIN");
        return Ok("Admin registered successfully.");
    }

    // POST api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto model)
    {
        var result = await _signInManager.PasswordSignInAsync(
            model.Email, model.Password, isPersistent: false, lockoutOnFailure: false);
        if (result.Succeeded) return Ok("Login successful.");
        return Unauthorized("Invalid login attempt.");
    }

    //POST api/aut/logout
    [HttpPost("logout")]
    public async Task<IActionResult> logout([FromBody] LoginDto model)
    {

        await _signInManager.SignOutAsync();
        return Ok("Logout successful.");
    }
    //POST api/aut/change-password
[HttpPost("change-password")]
public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto model)
{
    var user = await _userManager.GetUserAsync(User);
    if (user == null) return Unauthorized();

    var result = await _userManager.ChangePasswordAsync(user, model.OldPassword, model.NewPassword);

    if (!result.Succeeded)
    {
        return BadRequest(result.Errors);
    }
    await _signInManager.RefreshSignInAsync(user);

    return Ok("Password changed successfully." );
}
    // POST api/auth/register-customer
    [HttpPost("register-customer")]
    public async Task<IActionResult> RegisterCustomer([FromForm] RegisterUserDto model, [FromForm] IFormFile profilePicture)
    {
        var existingUser = await _userManager.FindByEmailAsync(model.Email);
        if (existingUser != null)
            return BadRequest(new[] { new { description = "Email is already registered." } });

        string profilePicPath = null;
        if (profilePicture != null && profilePicture.Length > 0)
        {
            var uploadsFolder = Path.Combine("assets", "uploads", "users");
            Directory.CreateDirectory(uploadsFolder);
            var fileName = Guid.NewGuid() + Path.GetExtension(profilePicture.FileName);
            var filePath = Path.Combine(uploadsFolder, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await profilePicture.CopyToAsync(stream);
            }
            profilePicPath = $"/assets/uploads/users/{fileName}";
        }

        var identityUser = new IdentityUser { UserName = model.Email, Email = model.Email };
        var result = await _userManager.CreateAsync(identityUser, model.Password);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        await _userManager.AddToRoleAsync(identityUser, "CUSTOMER");

        var user = new User
        {
            FirstName = model.FirstName,
            LastName = model.LastName,
            Email = model.Email,
            Phone = model.Phone,
            ProfilePicture = profilePicPath,
            Address = model.Address,
            Gender = model.Gender,
            DateOfBirth = model.DateOfBirth,
            Role = "CUSTOMER",
            IdentityUserId = identityUser.Id
        };
        // Save to AppDbContext
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok("Customer registered successfully.");
    }
}

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WeatherAPI.DTOs;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;
    public UsersController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _context.Users
            .Select(u => new UserDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                Phone = u.Phone,
                Role = u.Role
            })
            .ToListAsync();
        return Ok(users);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        return Ok(new UserDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Phone = user.Phone,
            Role = user.Role
        });
    }

    [HttpGet("{id:int}/orders")]
    public async Task<IActionResult> GetOrders(int id)
    {
        var exists = await _context.Users.AnyAsync(u => u.Id == id);
        if (!exists) return NotFound();

        var orders = await _context.Orders.Where(o => o.UserId == id).ToListAsync();
        return Ok(orders);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateUserDto dto)
    {
        var user = new User
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.Phone,
            Gender = dto.Gender,
            DateOfBirth = dto.DateOfBirth,
            Role = dto.Role
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = user.Id }, new UserDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Phone = user.Phone,
            Role = user.Role
        });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateUserDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.Email = dto.Email;
        user.Phone = dto.Phone;
        user.Role = dto.Role;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("bulk")]
    public async Task<IActionResult> BulkInsert(List<CreateUserDto> dtos)
    {
        var users = dtos.Select(dto => new User
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.Phone,
            Role = dto.Role
        }).ToList();

        await _context.Users.AddRangeAsync(users);
        await _context.SaveChangesAsync();
        return Ok(new { inserted = users.Count });
    }

    [HttpGet("with-orders")]
    public async Task<IActionResult> WithOrders()
    {
        var data = await _context.Users
            .Include(u => u.Orders)
            .ToListAsync();

        return Ok(data);
    }

    [HttpGet("count")]
    public async Task<IActionResult> Count()
        => Ok(new { totalUsers = await _context.Users.CountAsync() });

    [HttpGet("full-details")]
    public async Task<IActionResult> FullDetails()
    {
        var data = await _context.Users
            .Include(u => u.Orders)
                .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
            .ToListAsync();

        return Ok(data);
    }
}
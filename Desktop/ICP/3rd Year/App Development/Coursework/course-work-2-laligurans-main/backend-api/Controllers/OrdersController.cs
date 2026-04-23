using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WeatherAPI.DTOs;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;
    public OrdersController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var data = await _context.Orders
            .Select(o => new OrderDto
            {
                Id = o.Id,
                OrderDate = o.OrderDate,
                Status = o.Status,
                UserId = o.UserId,
                ItemCount = o.OrderItems.Count
            })
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return NotFound();

        return Ok(new OrderDetailDto
        {
            Id = order.Id,
            OrderDate = order.OrderDate,
            Status = order.Status,
                UserId = order.UserId,
            OrderItems = order.OrderItems.Select(oi => new OrderItemSummaryDto
            {
                ProductId = oi.ProductId,
                ProductName = oi.Product.Name,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice
            }).ToList()
        });
    }

    [HttpGet("{id:int}/items")]
    public async Task<IActionResult> GetItems(int id)
    {
        var exists = await _context.Orders.AnyAsync(o => o.Id == id);
        if (!exists) return NotFound();

        var items = await _context.OrderItems
            .Where(oi => oi.OrderId == id)
            .Select(oi => new OrderItemSummaryDto
            {
                ProductId = oi.ProductId,
                ProductName = oi.Product.Name,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice
            })
            .ToListAsync();
        return Ok(items);
    }

    [HttpGet("{id:int}/user")]
    public async Task<IActionResult> GetUser(int id)
    {
        var order = await _context.Orders
            .Include(o => o.User)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return NotFound();

        var u = order.User;
        return Ok(new UserDto
        {
            Id = u.Id,
            FirstName = u.FirstName,
            LastName = u.LastName,
            Email = u.Email,
            Phone = u.Phone,
            Role = u.Role
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateOrderDto dto)
    {
        var order = new Order
        {
            OrderDate = dto.OrderDate,
            Status = dto.Status,
            UserId = dto.UserId,
            OrderItems = dto.Items?.Select(i => new OrderItem
            {
                ProductId = i.ProductId,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice
            }).ToList()
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = order.Id }, new OrderDto
        {
            Id = order.Id,
            OrderDate = order.OrderDate,
            Status = order.Status,
            UserId = order.UserId,
            ItemCount = order.OrderItems?.Count ?? 0
        });
    }

    [HttpPost("{id:int}/items")]
    public async Task<IActionResult> AddItem(int id, CreateOrderLineDto item)
    {
        var orderExists = await _context.Orders.AnyAsync(o => o.Id == id);
        if (!orderExists) return NotFound("Order not found");

        var exists = await _context.OrderItems.AnyAsync(oi => oi.OrderId == id && oi.ProductId == item.ProductId);
        if (exists) return BadRequest("Item already exists in order");

        _context.OrderItems.Add(new OrderItem
        {
            OrderId = id,
            ProductId = item.ProductId,
            Quantity = item.Quantity,
            UnitPrice = item.UnitPrice
        });

        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateOrderDto dto)
    {
        var order = await _context.Orders.Include(o => o.OrderItems).FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound();

        order.OrderDate = dto.OrderDate;
        order.Status = dto.Status;
        order.UserId = dto.UserId;

        _context.OrderItems.RemoveRange(order.OrderItems);

        if (dto.Items != null && dto.Items.Any())
        {
            order.OrderItems = dto.Items.Select(i => new OrderItem
            {
                OrderId = id,
                ProductId = i.ProductId,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice
            }).ToList();
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return NotFound();

        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("bulk")]
    public async Task<IActionResult> BulkInsert(List<CreateOrderDto> dtos)
    {
        var orders = dtos.Select(dto => new Order
        {
            OrderDate = dto.OrderDate,
            Status = dto.Status,
            UserId = dto.UserId,
            OrderItems = dto.Items?.Select(i => new OrderItem
            {
                ProductId = i.ProductId,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice
            }).ToList()
        }).ToList();

        await _context.Orders.AddRangeAsync(orders);
        await _context.SaveChangesAsync();
        return Ok(new { inserted = orders.Count });
    }

    [HttpGet("with-details")]
    public async Task<IActionResult> WithDetails()
    {
        var data = await _context.Orders
            .Select(o => new OrderWithDetailsDto
            {
                Id = o.Id,
                OrderDate = o.OrderDate,
                Status = o.Status,
                User = new UserDto
                {
                    Id = o.User.Id,
                    FirstName = o.User.FirstName,
                    LastName = o.User.LastName,
                    Email = o.User.Email,
                    Phone = o.User.Phone,
                    Role = o.User.Role
                },
                OrderItems = o.OrderItems.Select(oi => new OrderItemSummaryDto
                {
                    ProductId = oi.ProductId,
                    ProductName = oi.Product.Name,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice
                }).ToList()
            })
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("count")]
    public async Task<IActionResult> Count()
        => Ok(new { totalOrders = await _context.Orders.CountAsync() });

    [HttpGet("total-amount")]
    public async Task<IActionResult> TotalAmount()
    {
        var total = await _context.OrderItems
            .SumAsync(oi => oi.UnitPrice * oi.Quantity);
        return Ok(new { totalAmount = total });
    }

    [HttpGet("top-users")]
    public async Task<IActionResult> TopUsers()
    {
        var data = await _context.Orders
            .GroupBy(o => new { o.UserId, o.User.FirstName, o.User.LastName })
            .Select(g => new
            {
                g.Key.UserId,
                UserName = g.Key.FirstName + " " + g.Key.LastName,
                OrderCount = g.Count()
            })
            .OrderByDescending(x => x.OrderCount)
            .ToListAsync();
        return Ok(data);
    }
}
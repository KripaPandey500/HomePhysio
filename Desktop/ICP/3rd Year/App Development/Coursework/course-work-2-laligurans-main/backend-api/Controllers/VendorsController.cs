using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WeatherAPI.DTOs;

[ApiController]
[Route("api/vendors")]
public class VendorsController : ControllerBase
{
    private readonly AppDbContext _context;
    public VendorsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> CreateVendor([FromBody] CreateVendorDto dto)
    {
        var vendor = new Vendor
        {
            Name = dto.Name,
            Email = dto.Email,
            Phone = dto.Phone
        };
        _context.Vendors.Add(vendor);
        await _context.SaveChangesAsync();
        return Ok(new VendorDto { Id = vendor.Id, Name = vendor.Name, Email = vendor.Email, Phone = vendor.Phone });
    }

    [HttpGet]
    public async Task<IActionResult> GetVendors()
    {
        var vendors = await _context.Vendors.ToListAsync();
        return Ok(vendors.Select(v => new VendorDto { Id = v.Id, Name = v.Name, Email = v.Email, Phone = v.Phone }));
    }
}

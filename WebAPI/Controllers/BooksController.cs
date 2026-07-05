using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.Models;
using Microsoft.AspNetCore.Authorization;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BooksController : ControllerBase
    {
        private readonly LibraryContext _context;

        public BooksController(LibraryContext context)
        {
            _context = context;
        }

        // GET: api/books
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Book>>> GetBooks()
        {
            return await _context.Books
                .Include(b => b.Author)
                .Include(b => b.Category)
                .ToListAsync();
        }

        // GET: api/books/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Book>> GetBook(int id)
        {
            var book = await _context.Books
                .Include(b => b.Author)
                .Include(b => b.Category)
                .FirstOrDefaultAsync(b => b.BookId == id);

            if (book == null) return NotFound();
            return book;
        }

        // POST: api/books
        [HttpPost]
        public async Task<ActionResult<Book>> CreateBook(Book book)
        {
            bool exists = await _context.Books.AnyAsync(b =>
                b.Title.ToLower() == book.Title.ToLower() && b.AuthorId == book.AuthorId);

            if (exists)
                return Conflict(new { message = "This author already has a book with this title." });

            _context.Books.Add(book);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetBook), new { id = book.BookId }, book);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBook(int id, Book book)
        {
            if (id != book.BookId) return BadRequest();

            bool exists = await _context.Books.AnyAsync(b =>
                b.BookId != id && b.Title.ToLower() == book.Title.ToLower() && b.AuthorId == book.AuthorId);

            if (exists)
                return Conflict(new { message = "This author already has a book with this title." });

            _context.Entry(book).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Books.AnyAsync(b => b.BookId == id))
                    return NotFound();
                throw;
            }

            return NoContent();
        }

        // DELETE: api/books/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return NotFound();

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
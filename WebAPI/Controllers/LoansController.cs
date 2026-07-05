using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.Models;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LoansController : ControllerBase
    {
        private readonly LibraryContext _context;
        public LoansController(LibraryContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Loan>>> GetLoans()
        {
            return await _context.Loans
                .Include(l => l.Book)
                .Include(l => l.Member)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Loan>> GetLoan(int id)
        {
            var loan = await _context.Loans
                .Include(l => l.Book)
                .Include(l => l.Member)
                .FirstOrDefaultAsync(l => l.LoanId == id);

            if (loan == null) return NotFound();
            return loan;
        }

        // POST: api/loans — creating a loan decrements AvailableCopies
        [HttpPost]
        public async Task<ActionResult<Loan>> CreateLoan(Loan loan)
        {
            var book = await _context.Books.FindAsync(loan.BookId);
            if (book == null) return BadRequest($"Book with id {loan.BookId} does not exist.");

            var memberExists = await _context.Members.AnyAsync(m => m.MemberId == loan.MemberId);
            if (!memberExists) return BadRequest($"Member with id {loan.MemberId} does not exist.");

            if (book.AvailableCopies <= 0)
                return BadRequest("No available copies of this book to borrow.");

            book.AvailableCopies -= 1;

            _context.Loans.Add(loan);
            await _context.SaveChangesAsync();

            await _context.Entry(loan).Reference(l => l.Book).LoadAsync();
            await _context.Entry(loan).Reference(l => l.Member).LoadAsync();

            return CreatedAtAction(nameof(GetLoan), new { id = loan.LoanId }, loan);
        }

        // PUT: api/loans/5 — adjusts AvailableCopies if ReturnDate transitions
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLoan(int id, Loan updatedLoan)
        {
            if (id != updatedLoan.LoanId) return BadRequest();

            var existingLoan = await _context.Loans.FindAsync(id);
            if (existingLoan == null) return NotFound();

            var book = await _context.Books.FindAsync(existingLoan.BookId);
            if (book == null) return BadRequest("Associated book no longer exists.");

            bool wasReturned = existingLoan.ReturnDate != null;
            bool isNowReturned = updatedLoan.ReturnDate != null;

            // Transition: active -> returned => book becomes available again
            if (!wasReturned && isNowReturned)
            {
                book.AvailableCopies += 1;
            }
            // Transition: returned -> active (someone un-returns it) => book becomes unavailable again
            else if (wasReturned && !isNowReturned)
            {
                if (book.AvailableCopies <= 0)
                    return BadRequest("Cannot reactivate loan: no available copies remain.");
                book.AvailableCopies -= 1;
            }

            existingLoan.BookId = updatedLoan.BookId;
            existingLoan.MemberId = updatedLoan.MemberId;
            existingLoan.LoanDate = updatedLoan.LoanDate;
            existingLoan.DueDate = updatedLoan.DueDate;
            existingLoan.ReturnDate = updatedLoan.ReturnDate;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/loans/5 — deleting an active (unreturned) loan restores the copy
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLoan(int id)
        {
            var loan = await _context.Loans.FindAsync(id);
            if (loan == null) return NotFound();

            if (loan.ReturnDate == null)
            {
                var book = await _context.Books.FindAsync(loan.BookId);
                if (book != null)
                {
                    book.AvailableCopies += 1;
                }
            }

            _context.Loans.Remove(loan);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
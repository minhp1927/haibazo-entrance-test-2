import { useState, useEffect } from "react";
import "./App.css";

const API_BASE_URL = "http://localhost:8000/api"; 

function App() {
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [bookDetail, setBookDetail] = useState(null);

  // Form state for write new review
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  // Load books data
  useEffect(() => {
    fetch(`${API_BASE_URL}/books`)
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((err) => console.error("Lỗi lấy danh sách sách:", err));
  }, []);

  // Load book detail
  useEffect(() => {
    if (selectedBookId !== null) {
      fetch(`${API_BASE_URL}/books/${selectedBookId}`)
        .then((res) => res.json())
        .then((data) => setBookDetail(data))
        .catch((err) => console.error("Error fetching book detail:", err));
    } else {
      setBookDetail(null);
    }
  }, [selectedBookId]);

  // 3. Send review to server
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewerName || !reviewText) return alert("Vui lòng điền đủ thông tin!");

    fetch(`${API_BASE_URL}/reviews?book_id=${selectedBookId}&reviewer_name=${encodeURIComponent(reviewerName)}&rating=${rating}&review_text=${encodeURIComponent(reviewText)}`, {
      method: "POST"
    })
      .then((res) => res.json())
      .then(() => {
        // Tải lại chi tiết sách để cập nhật danh sách review mới vừa đăng
        setSelectedBookId(null);
        setTimeout(() => setSelectedBookId(bookDetail.id), 50);
        
        // Reset form 
        setReviewerName("");
        setReviewText("");
        alert("Review submitted successfully!");
      });
  };

  return (
    <div className="app-container">
        <header>
            <h1>Book Review Hub</h1>
        </header>
        
        {selectedBookId === null ? (
          <div className="book-grid">
            {books.map((book)=>(
              <div key={book.id} className="book-card" onClick={()=> setSelectedBookId(book.id)}>
                {/* Ăn gian hiển thị: Nếu description chứa link ảnh thì lấy link ảnh, không thì dùng cover_image */}
                <img 
                  src={book.description && book.description.includes('|') ? book.description.split('|')[0].trim() : (book.cover_image || "https://via.placeholder.com/150")} 
                  alt={book.title} 
                />
                <h3>{book.title}</h3>
                <p>Author: {book.author}</p>
                <button onClick={(e) => { e.stopPropagation(); setSelectedBookId(book.id); }}>View Details</button>
              </div>
            ))}
          </div>
        ) : (
          bookDetail && (
            <div className="detail-view">
              <button className="back-btn" onClick={() => setSelectedBookId(null)}>Back to Books</button>
              <h2>{bookDetail.title}</h2>
              <p><strong>Author: </strong>{bookDetail.author}</p>
              {/* Hiển thị phần text mô tả sau khi đã bóc tách link ảnh */}
              <p>{bookDetail.description && bookDetail.description.includes('|') ? bookDetail.description.split('|')[1].trim() : bookDetail.description}</p>
              <hr />
              <h3> Reviews from Authors ({bookDetail.reviews?.length || 0})</h3>
              <div>
                {bookDetail.reviews?.map((review) => (
                  <div key={review.id} className="review-item">
                    {/* Đã sửa toàn bộ chữ rev thành review ở dưới đây */}
                    <div className="stars">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
                    <strong>{review.reviewer_name}</strong>
                    <p>{review.review_text}</p>
                  </div>
                ))}
              </div>
              
              <form className="review-form" onSubmit={handleReviewSubmit}>
                <h3>Submit Your Review</h3>
                <div className="form-group">
                  <label> Reviewer Name: </label>
                  <input 
                    type="text" 
                    value={reviewerName} 
                    onChange={(e) => setReviewerName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label> Rating: </label>
                  <select 
                    value={rating} 
                    onChange={(e) => setRating(e.target.value)} 
                    required 
                  >
                    <option value={1}>1 Star</option>
                    <option value={2}>2 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={5}>5 Stars</option>
                  </select>
                </div>
                <div className="form-group">
                  <label> Review Text: </label>
                  <textarea 
                    rows="4"
                    value={reviewText} 
                    onChange={(e) => setReviewText(e.target.value)} 
                    required 
                  />
                </div>
                <button type="submit">Submit Review</button>
              </form>
            </div>
          )
        )}
    </div>
  );
}

export default App;
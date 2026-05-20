import { useState, useEffect } from "react";
import "./App.css";

const API_BASE_URL = "http://localhost:8000/api"; // URL của Backend FastAPI

function App() {
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [bookDetail, setBookDetail] = useState(null);

  // Form states cho việc viết Review mới
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  // 1. Tải danh sách sách khi mở web
  useEffect(() => {
    fetch(`${API_BASE_URL}/books`)
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((err) => console.error("Lỗi lấy danh sách sách:", err));
  }, []);

  // 2. Tải chi tiết một cuốn sách khi người dùng bấm vào
  useEffect(() => {
    if (selectedBookId !== null) {
      fetch(`${API_BASE_URL}/books/${selectedBookId}`)
        .then((res) => res.json())
        .then((data) => setBookDetail(data))
        .catch((err) => console.error("Lỗi lấy chi tiết sách:", err));
    } else {
      setBookDetail(null);
    }
  }, [selectedBookId]);

  // 3. Hàm gửi Review mới lên server
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewerName || !reviewText) return alert("Vui lòng điền đủ thông tin!");

    fetch(`${API_BASE_URL}/reviews?book_id=${selectedBookId}&reviewer_name=${encodeURIComponent(reviewerName)}&rating=${rating}&review_text=${encodeURIComponent(reviewText)}`, {
      method: "POST"
    })
      .then((res) => res.json())
      .then(() => {
        // Tải lại chi tiết sách để cập nhật danh sách review mới ngay lập tức
        setSelectedBookId(null);
        setTimeout(() => setSelectedBookId(bookDetail.id), 50);
        
        // Reset form nhập
        setReviewerName("");
        setReviewText("");
        alert("Đăng đánh giá thành công!");
      });
  };

  return (
    <div className="app-container">
      <header>
        <h1>📚 BOOK REVIEW HUB</h1>
      </header>

      {/* MÀN HÌNH 1: DANH SÁCH SÁCH (Khi chưa chọn cuốn nào) */}
      {selectedBookId === null ? (
        <div className="books-grid">
          {books.map((book) => (
            <div key={book.id} className="book-card" onClick={() => setSelectedBookId(book.id)}>
              <img src={book.cover_image || "https://via.placeholder.com/150"} alt={book.title} />
              <h3>{book.title}</h3>
              <p>Tác giả: {book.author}</p>
            </div>
          ))}
        </div>
      ) : (
        /* MÀN HÌNH 2: CHI TIẾT SÁCH & ĐÁNH GIÁ */
        bookDetail && (
          <div className="detail-view">
            <button className="back-btn" onClick={() => setSelectedBookId(null)}>⬅ Quay lại trang chủ</button>
            <h2>{bookDetail.title}</h2>
            <p><strong>Tác giả:</strong> {bookDetail.author}</p>
            <p>{bookDetail.description}</p>

            <hr />
            <h3>Đánh giá từ độc giả ({bookDetail.reviews?.length || 0})</h3>
            <div>
              {bookDetail.reviews?.map((rev) => (
                <div key={rev.id} className="review-item">
                  <div className="stars">{"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}</div>
                  <strong>{rev.reviewer_name}</strong>
                  <p>{rev.review_text}</p>
                </div>
              ))}
            </div>

            {/* FORM VIẾT REVIEW MỚI */}
            <form className="review-form" onSubmit={handleReviewSubmit}>
              <h3>Để lại đánh giá của bạn</h3>
              <div className="form-group">
                <label>Tên của bạn:</label>
                <input type="text" value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Số sao (Rating):</label>
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                  <option value={5}>5 Sao (Xuất sắc)</option>
                  <option value={4}>4 Sao (Tốt)</option>
                  <option value={3}>3 Sao (Bình thường)</option>
                  <option value={2}>2 Sao (Tệ)</option>
                  <option value={1}>1 Sao (Quá tệ)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Nội dung nhận xét:</label>
                <textarea rows="4" value={reviewText} onChange={(e) => setReviewText(e.target.value)}></textarea>
              </div>
              <button type="submit" className="submit-btn">Gửi đánh giá</button>
            </form>
          </div>
        )
      )}
    </div>
  );
}

export default App;
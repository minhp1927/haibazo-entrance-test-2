from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models
from database import engine, get_db

# Tạo bảng tự động trong PostgreSQL nếu chưa có
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Book Review API")

# CẤU HÌNH CORS: Cho phép ReactJS ở Frontend gọi được API sang Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Lúc dev có thể để "*" hoặc điền URL React của bạn vào
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 1: Lấy toàn bộ danh sách sách
@app.get("/api/books")
def get_all_books(db: Session = Depends(get_db)):
    return db.query(models.Book).all()

# API 2: Lấy chi tiết 1 cuốn sách kèm theo danh sách các Review của nó
@app.get("/api/books/{book_id}")
def get_book_detail(book_id: int, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Không tìm thấy sách!")
    
    # Ép cấu trúc trả về bao gồm thông tin sách và mảng reviews
    return {
        "id": book.id,
        "title": book.title,
        "author": book.author,
        "description": book.description,
        "cover_image": book.cover_image,
        "reviews": book.reviews
    }

# API 3: Viết đánh giá (Review) mới cho một cuốn sách
@app.post("/api/reviews")
def create_review(book_id: int, reviewer_name: str, rating: int, review_text: str, db: Session = Depends(get_db)):
    # Kiểm tra xem sách có tồn tại thật không
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Sách không tồn tại để review")
    
    new_review = models.Review(
        book_id=book_id,
        reviewer_name=reviewer_name,
        rating=rating,
        review_text=review_text
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return {"message": "Đăng review thành công!", "review": new_review}
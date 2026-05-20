from fastapi import FastAPI, Depends,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models
from database import get_db,engine

# Tạo bảng trong database
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#API 1: Get all books
@app.get("/api/books")
def get_all_books(db: Session = Depends(get_db)):
    return db.query(models.Book).all()
#API 2: Get book by ID
@app.get("/api/books/{book_id}")
def get_book_by_id(book_id: int, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book
    #Force return include book info and review array
    return{
    "id": book.id,
    "title": book.title,
    "author": book.author,
    "description": book.description,
    "cover_image": book.cover_image,
    "reviews": book.reviews
    }

#API 3: Write Review
@app.post("/api/reviews")
def create_review(book_id: int, reiviewer_name: str, rating: int, review_text: str, db: Session = Depends(get_db)):
    # Check if book exists
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Create new review
    new_review = models.Review(
        book_id=book_id,
        reviewer_name=reiviewer_name,
        rating=rating,
        review_text=review_text
    )
    
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    return {"message": "Review created successfully", "review": new_review}
    
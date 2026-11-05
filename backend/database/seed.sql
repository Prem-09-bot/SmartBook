
USE smartbook_db;

-- ==========================================
-- 1. INSERT CATEGORIES
-- ==========================================

INSERT INTO categories (name, slug, description)
VALUES
('Thriller', 'thriller', 'Psychological and suspenseful stories'),
('Self Development', 'self-development', 'Books for personal growth and improvement'),
('Finance', 'finance', 'Personal finance, money and wealth'),
('Philosophy', 'philosophy', 'Ideas, purpose and ways of thinking'),
('Productivity', 'productivity', 'Focus, efficiency and better work'),
('Fiction', 'fiction', 'Stories, novels and literary works'),
('Personal Development', 'personal-development', 'Books about personal ambition and growth'),
('Mystery', 'mystery', 'Detective stories and intriguing mysteries')
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description);


-- ==========================================
-- 2. INSERT ORIGINAL FRONTEND BOOKS
-- ==========================================

INSERT INTO books (
    slug, title, author, category_id,
    price, original_price, rating, review_count,
    badge, cover_color, cover_accent, cover_text,
    description, pages, language, stock_quantity
)
SELECT
    b.slug, b.title, b.author, c.id,
    b.price, b.original_price, b.rating, b.review_count,
    b.badge, b.cover_color, b.cover_accent, b.cover_text,
    b.description, b.pages, 'English', 0
FROM (
    SELECT
        'silent-patient' AS slug,
        'The Silent Patient' AS title,
        'Alex Michaelides' AS author,
        'thriller' AS category,
        349.00 AS price, 499.00 AS original_price,
        4.8 AS rating, 2840 AS review_count,
        'Bestseller' AS badge,
        '#293b36' AS cover_color, '#c4a66a' AS cover_accent,
        'THE SILENT PATIENT' AS cover_text,
        'A gripping psychological thriller about a woman who refuses to speak and the therapist determined to uncover her story.' AS description,
        336 AS pages

    UNION ALL SELECT
        'atomic-habits', 'Atomic Habits', 'James Clear',
        'self-development', 399.00, 599.00, 4.9, 5200,
        'Popular', '#d8e5d0', '#315b43', 'ATOMIC HABITS',
        'A practical guide to building good habits, breaking bad ones, and making small changes that lead to remarkable results.',
        320

    UNION ALL SELECT
        'psychology-of-money', 'The Psychology of Money', 'Morgan Housel',
        'finance', 299.00, 450.00, 4.7, 3100,
        'Reader Favourite', '#d8c6a2', '#513d27',
        'THE PSYCHOLOGY OF MONEY',
        'Timeless lessons on wealth, greed, happiness, and the surprising ways people think about money.',
        256

    UNION ALL SELECT
        'ikigai', 'Ikigai',
        'Héctor García and Francesc Miralles',
        'philosophy', 279.00, 399.00, 4.6, 2400,
        'Staff Pick', '#e6d5c0', '#8a4835', 'IKIGAI',
        'Explore the Japanese concept of finding purpose, cultivating meaningful routines, and living with intention.',
        208

    UNION ALL SELECT
        'rich-dad-poor-dad', 'Rich Dad Poor Dad',
        'Robert T. Kiyosaki', 'finance',
        329.00, 499.00, 4.7, 4100,
        'Bestseller', '#e7d5b3', '#433a2d',
        'RICH DAD POOR DAD',
        'A personal finance book exploring different attitudes toward money, work, assets, and financial independence.',
        336

    UNION ALL SELECT
        'deep-work', 'Deep Work', 'Cal Newport',
        'productivity', 359.00, 499.00, 4.5, 1800,
        '', '#1c3151', '#e5c58c', 'DEEP WORK',
        'Learn how focused, distraction-free work can improve productivity and help you master challenging skills.',
        296

    UNION ALL SELECT
        'alchemist', 'The Alchemist', 'Paulo Coelho',
        'fiction', 249.00, 350.00, 4.8, 3600,
        'Classic', '#e6c98e', '#6e4828', 'THE ALCHEMIST',
        'A philosophical adventure about a young shepherd following his dreams and discovering the meaning of his journey.',
        208

    UNION ALL SELECT
        'think-grow-rich', 'Think and Grow Rich',
        'Napoleon Hill', 'personal-development',
        269.00, 399.00, 4.5, 2100,
        '', '#292929', '#d5b56e', 'THINK AND GROW RICH',
        'A classic book about goal setting, persistence, personal ambition, and developing a success-oriented mindset.',
        320

    UNION ALL SELECT
        '1984', '1984', 'George Orwell',
        'fiction', 229.00, 349.00, 4.7, 2900,
        'Classic', '#652c2c', '#e4d3b8', '1984',
        'A landmark dystopian novel exploring surveillance, propaganda, authoritarianism, and individual freedom.',
        328

    UNION ALL SELECT
        'the-power-of-now', 'The Power of Now',
        'Eckhart Tolle', 'philosophy',
        319.00, 449.00, 4.6, 1700,
        '', '#c4d3b8', '#40583e', 'THE POWER OF NOW',
        'A guide to mindfulness that encourages readers to focus on the present moment and develop greater awareness.',
        236

    UNION ALL SELECT
        'the-subtle-art', 'The Subtle Art of Not Giving a F*ck',
        'Mark Manson', 'self-development',
        339.00, 499.00, 4.4, 2700,
        'Popular', '#e1a04d', '#29251e', 'THE SUBTLE ART',
        'A provocative approach to choosing meaningful values, accepting limitations, and focusing on what matters.',
        224

    UNION ALL SELECT
        'sherlock-holmes', 'The Adventures of Sherlock Holmes',
        'Arthur Conan Doyle', 'mystery',
        259.00, 379.00, 4.8, 1900,
        'Classic', '#344c4a', '#d6bf8c', 'SHERLOCK HOLMES',
        'A collection of detective stories featuring Sherlock Holmes and Dr Watson as they solve intriguing mysteries.',
        307
) AS b
JOIN categories AS c ON c.slug = b.category

ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    author = VALUES(author),
    category_id = VALUES(category_id),
    price = VALUES(price),
    original_price = VALUES(original_price),
    rating = VALUES(rating),
    review_count = VALUES(review_count),
    badge = VALUES(badge),
    cover_color = VALUES(cover_color),
    cover_accent = VALUES(cover_accent),
    cover_text = VALUES(cover_text),
    description = VALUES(description),
    pages = VALUES(pages),
    language = VALUES(language);


-- ==========================================
-- 3. VERIFICATION
-- ==========================================

SELECT COUNT(*) AS total_categories FROM categories;
SELECT COUNT(*) AS total_books FROM books;

SELECT
    b.slug,
    b.title,
    b.author,
    c.name AS category,
    b.price,
    b.stock_quantity
FROM books b
LEFT JOIN categories c ON b.category_id = c.id
ORDER BY b.title;

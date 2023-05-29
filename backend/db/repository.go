package db

import (
	"context"
	"database/sql"

	"github.com/ChihiroShoda/mecari-build-hackathon-2023/backend/domain"
)

type UserRepository interface {
	AddUser(ctx context.Context, user domain.User) (int64, error)
	GetUser(ctx context.Context, id int64) (domain.User, error)
	UpdateBalance(ctx context.Context, id int64, balance int64) error
}

type UserDBRepository struct {
	*sql.DB
}

func NewUserRepository(db *sql.DB) UserRepository {
	return &UserDBRepository{DB: db}
}

func (r *UserDBRepository) AddUser(ctx context.Context, user domain.User) (int64, error) {
	if _, err := r.ExecContext(ctx, "INSERT INTO users (name, password) VALUES (?, ?)", user.Name, user.Password); err != nil {
		return 0, err
	}
	// TODO: if other insert query is executed at the same time, it might return wrong id
	// http.StatusConflict(409) 既に同じIDがあった場合
	row := r.QueryRowContext(ctx, "SELECT id FROM users WHERE rowid = LAST_INSERT_ROWID()")

	var id int64
	return id, row.Scan(&id)
}

func (r *UserDBRepository) GetUser(ctx context.Context, id int64) (domain.User, error) {
	row := r.QueryRowContext(ctx, "SELECT * FROM users WHERE id = ?", id)

	var user domain.User
	return user, row.Scan(&user.ID, &user.Name, &user.Password, &user.Balance)
}

func (r *UserDBRepository) UpdateBalance(ctx context.Context, id int64, balance int64) error {
	if _, err := r.ExecContext(ctx, "UPDATE users SET balance = ? WHERE id = ?", balance, id); err != nil {
		return err
	}
	return nil
}

type ItemRepository interface {
	AddItem(ctx context.Context, item domain.Item) (domain.Item, error)
	GetItem(ctx context.Context, id int32) (domain.Item, error)
	GetItemImage(ctx context.Context, id int32) ([]byte, error)
	GetOnSaleItems(ctx context.Context) ([]domain.Item, error)
	GetItemsByUserID(ctx context.Context, userID int64) ([]domain.Item, error)
	GetItemsByName(ctx context.Context, searchWord string) ([]domain.Item, error)
	GetCategory(ctx context.Context, id int64) (domain.Category, error)
	GetCategories(ctx context.Context) ([]domain.Category, error)
	UpdateItem(ctx context.Context, item domain.Item) (domain.Item, error)
	UpdateItemStatus(ctx context.Context, id int32, status domain.ItemStatus) error
	GetFolders(ctx context.Context, id int64) ([]domain.FavoriteFolder, error)
	AddItemToFavoriteFolder(ctx context.Context, itemID int32, folderID int32) error
	GetFavoriteItems(ctx context.Context, folderID int64) ([]domain.FavoriteItem, error)
	RemoveFavoriteItem(ctx context.Context, itemID int32, folderID int32) error
	AddFavoriteFolder(ctx context.Context, userID int64, folderName string) error
}

type ItemDBRepository struct {
	*sql.DB
}

func NewItemRepository(db *sql.DB) ItemRepository {
	return &ItemDBRepository{DB: db}
}

func (r *ItemDBRepository) AddItem(ctx context.Context, item domain.Item) (domain.Item, error) {
	if _, err := r.ExecContext(ctx, "INSERT INTO items (name, price, description, category_id, seller_id, image, status) VALUES (?, ?, ?, ?, ?, ?, ?)", item.Name, item.Price, item.Description, item.CategoryID, item.UserID, item.Image, item.Status); err != nil {
		return domain.Item{}, err
	}
	// TODO: if other insert query is executed at the same time, it might return wrong id
	// http.StatusConflict(409) 既に同じIDがあった場合
	row := r.QueryRowContext(ctx, "SELECT * FROM items WHERE rowid = LAST_INSERT_ROWID()")

	var res domain.Item
	return res, row.Scan(&res.ID, &res.Name, &res.Price, &res.Description, &res.CategoryID, &res.UserID, &res.Image, &res.Status, &res.CreatedAt, &res.UpdatedAt)
}

func (r *ItemDBRepository) UpdateItem(ctx context.Context, item domain.Item) (domain.Item, error) {
	if _, err := r.ExecContext(ctx, "UPDATE items SET name = ?, price = ?, description = ?, category_id = ?, image = ? WHERE id = ?", item.Name, item.Price, item.Description, item.CategoryID, item.Image, item.ID); err != nil {
		return domain.Item{}, err
	}
	return domain.Item{ID: item.ID}, nil
}

func (r *ItemDBRepository) GetItem(ctx context.Context, id int32) (domain.Item, error) {
	row := r.QueryRowContext(ctx, "SELECT * FROM items WHERE id = ?", id)

	var item domain.Item
	return item, row.Scan(&item.ID, &item.Name, &item.Price, &item.Description, &item.CategoryID, &item.UserID, &item.Image, &item.Status, &item.CreatedAt, &item.UpdatedAt)
}

func (r *ItemDBRepository) GetItemImage(ctx context.Context, id int32) ([]byte, error) {
	row := r.QueryRowContext(ctx, "SELECT image FROM items WHERE id = ?", id)
	var image []byte
	return image, row.Scan(&image)
}

func (r *ItemDBRepository) GetOnSaleItems(ctx context.Context) ([]domain.Item, error) {
	rows, err := r.QueryContext(ctx, "SELECT * FROM items WHERE status = ? ORDER BY updated_at desc", domain.ItemStatusOnSale)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []domain.Item
	for rows.Next() {
		var item domain.Item
		if err := rows.Scan(&item.ID, &item.Name, &item.Price, &item.Description, &item.CategoryID, &item.UserID, &item.Image, &item.Status, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *ItemDBRepository) GetItemsByUserID(ctx context.Context, userID int64) ([]domain.Item, error) {
	rows, err := r.QueryContext(ctx, "SELECT * FROM items WHERE seller_id = ?", userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []domain.Item
	for rows.Next() {
		var item domain.Item
		if err := rows.Scan(&item.ID, &item.Name, &item.Price, &item.Description, &item.CategoryID, &item.UserID, &item.Image, &item.Status, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *ItemDBRepository) GetItemsByName(ctx context.Context, searchWord string) ([]domain.Item, error) {
	rows, err := r.QueryContext(ctx, "SELECT * FROM items WHERE name LIKE ? AND status = ? ORDER BY updated_at desc", "%" + searchWord + "%",domain.ItemStatusOnSale)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []domain.Item
	for rows.Next() {
		var item domain.Item
		if err := rows.Scan(&item.ID, &item.Name, &item.Price, &item.Description, &item.CategoryID, &item.UserID, &item.Image, &item.Status, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *ItemDBRepository) UpdateItemStatus(ctx context.Context, id int32, status domain.ItemStatus) error {
	if _, err := r.ExecContext(ctx, "UPDATE items SET status = ? WHERE id = ?", status, id); err != nil {
		return err
	}
	return nil
}

func (r *ItemDBRepository) GetCategory(ctx context.Context, id int64) (domain.Category, error) {
	row := r.QueryRowContext(ctx, "SELECT * FROM category WHERE id = ?", id)

	var cat domain.Category
	return cat, row.Scan(&cat.ID, &cat.Name)
}

func (r *ItemDBRepository) GetCategories(ctx context.Context) ([]domain.Category, error) {
	rows, err := r.QueryContext(ctx, "SELECT * FROM category")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cats []domain.Category
	for rows.Next() {
		var cat domain.Category
		if err := rows.Scan(&cat.ID, &cat.Name); err != nil {
			return nil, err
		}
		cats = append(cats, cat)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return cats, nil
}

func (r *ItemDBRepository) GetFolders(ctx context.Context, id int64) ([]domain.FavoriteFolder, error) {
	rows, err := r.QueryContext(ctx, "SELECT * FROM favoriteFolders WHERE user_id = ?", id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var folders []domain.FavoriteFolder
	for rows.Next() {
		var folder domain.FavoriteFolder
		if err := rows.Scan(&folder.UserID, &folder.FavoriteFolderID, &folder.FavoriteFolderName); err != nil {
			return nil, err
		}
		folders = append(folders, folder)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return folders, nil
}

func (r *ItemDBRepository) AddItemToFavoriteFolder(ctx context.Context, itemID int32, folderID int32) error {
	if _, err := r.ExecContext(ctx, "INSERT INTO favorite (item_id, favorite_folder_id) VALUES (?, ?)", itemID, folderID); err != nil {
		return err
	}
	return nil
}

func (r *ItemDBRepository) GetFavoriteItems(ctx context.Context, folderID int64) ([]domain.FavoriteItem, error) {
	rows, err := r.QueryContext(ctx, "SELECT DISTINCT * FROM favorite WHERE favorite_folder_id = ?", folderID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []domain.FavoriteItem
	for rows.Next() {
		var item domain.FavoriteItem
		if err := rows.Scan(&item.ItemID, &item.FolderID); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *ItemDBRepository) RemoveFavoriteItem(ctx context.Context, itemID int32, folderID int32) error {
	if _, err := r.ExecContext(ctx, "DELETE FROM favorite WHERE item_id = ? and favorite_folder_id = ?", itemID, folderID); err != nil {
		return err
	}
	return nil
}

func (r *ItemDBRepository) AddFavoriteFolder(ctx context.Context, userID int64, folderName string) error {
	if _, err := r.ExecContext(ctx, "INSERT INTO favoriteFolders (user_id, favorite_folder_name) VALUES (?, ?)", userID, folderName); err != nil {
		return err
	}
	return nil
}

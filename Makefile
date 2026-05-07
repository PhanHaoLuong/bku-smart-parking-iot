# BKU Smart Parking — Dev runner
# Usage:
#   make dev          → MongoDB + backend + frontend
#   make db           → MongoDB (27017)
#   make be           → backend (Express :5000)
#   make fe           → web-frontend (Vite :5173)
#   make stop-db      → dừng DB containers
#   make logs-db      → xem log DB

.PHONY: dev db be fe stop-db logs-db

# ── Paths ─────────────────────────────────────────────────────────────────────
BACKEND_DIR := backend
FRONTEND_DIR := frontend

# ── Màu terminal ──────────────────────────────────────────────────────────────
CYAN  := \033[0;36m
RESET := \033[0m

# ── DB ────────────────────────────────────────────────────────────────────────
db:
	@echo "$(CYAN)▶ Khởi động MongoDB (27017)...$(RESET)"
	docker compose up mongo -d || \
	  (echo "$(CYAN)⚠ DB có thể đang chạy rồi — kiểm tra: docker ps$(RESET)" && true)
	@echo "$(CYAN)✓ DB: MongoDB→27017$(RESET)"

stop-db:
	docker compose stop mongo

logs-db:
	docker compose logs -f mongo

# ── Individual services ───────────────────────────────────────────────────────
be:
	@echo "$(CYAN)▶ backend (Express :5000) — $(BACKEND_DIR)$(RESET)"
	npm --prefix $(BACKEND_DIR) run dev

fe:
	@echo "$(CYAN)▶ frontend (Vite :5173) — $(FRONTEND_DIR)$(RESET)"
	npm --prefix $(FRONTEND_DIR) run dev

# ── Dev: toàn bộ trong 1 lệnh ─────────────────────────────────────────────────
# Dùng & để chạy song song, trap để dừng sạch khi Ctrl+C
dev: db
	@echo "$(CYAN)▶ Khởi động tất cả services (backend :5000, frontend :5173)...$(RESET)"
	@echo "$(CYAN)  Nhấn Ctrl+C để dừng tất cả$(RESET)"
	@trap 'kill 0' SIGINT; \
	  (npm --prefix $(BACKEND_DIR) run dev 2>&1 | sed "s/^/[be]   /") & \
	  (npm --prefix $(FRONTEND_DIR) run dev 2>&1 | sed "s/^/[fe]   /") & \
	  wait

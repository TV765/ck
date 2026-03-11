<template>
  <div class="view-section fade-in">
    <!-- HEADER -->
    <div class="header-row">
      <h1 class="page-title">
        <i class="fas fa-ticket-alt title-icon"></i>
        Quản Lý Voucher
      </h1>

      <button @click="openModal('add')" class="btn-primary">
        <i class="fas fa-plus"></i> Thêm Voucher Mới
      </button>
    </div>

    <!-- TABLE -->
    <div class="table-container">
      <table class="data-table">
        <thead>
        <tr>
          <th>Code</th>
          <th>Mô tả</th>
          <th>Loại</th>
          <th>Giá trị</th>
          <th>Giới hạn</th>
          <th>Bắt đầu</th>
          <th>Kết thúc</th>
          <th>Kích hoạt</th>
          <th>Hành động</th>
        </tr>
        </thead>

        <tbody>
        <!-- Loading -->
        <tr v-if="loading">
          <td colspan="9" class="text-center">Đang tải dữ liệu...</td>
        </tr>

        <!-- Empty -->
        <tr v-else-if="vouchers.length === 0">
          <td colspan="9" class="text-center">Không có voucher nào.</td>
        </tr>

        <!-- Data -->
        <tr v-else v-for="v in vouchers" :key="v.id">
          <td>{{ v.code }}</td>

          <td class="desc-cell" :title="v.description">
            {{ v.description }}
          </td>

          <td>
            <span
                class="badge"
                :class="v.discountType === 'PERCENT' ? 'badge-percent' : 'badge-fixed'"
            >
              {{ v.discountType === 'PERCENT' ? 'Giảm %' : 'Giảm VNĐ' }}
            </span>
          </td>

          <td>
            {{ v.discountType === "PERCENT"
              ? v.discountValue + "%"
              : formatPrice(v.discountValue) }}
          </td>

          <td>{{ v.usageLimit || "∞" }}</td>
          <td>{{ formatDate(v.startDate) }}</td>
          <td>{{ formatDate(v.endDate) }}</td>

          <td>
            <span
                class="status-pill"
                :class="v.active ? 'active' : 'inactive'"
            >
              {{ v.active ? "Đang kích hoạt" : "Tạm tắt" }}
            </span>
          </td>

          <td class="actions">
            <button
                class="btn-icon edit"
                @click="openModal('edit', v)"
            >
              <i class="fas fa-edit"></i>
            </button>

            <button
                class="btn-icon delete"
                @click="deleteVoucher(v.id)"
            >
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL -->
    <div v-if="isModalOpen" class="modal-overlay">
      <div class="modal-content">
        <span @click="closeModal" class="close-btn">&times;</span>

        <h2 class="modal-title">
          {{ modalMode === "add" ? "Thêm Voucher" : "Chỉnh Sửa Voucher" }}
        </h2>

        <form @submit.prevent="saveVoucher" class="voucher-form">
          <!-- Code + Type -->
          <div class="form-row">
            <div class="form-group">
              <label>Mã voucher*</label>
              <input v-model="form.code" required />
            </div>

            <div class="form-group">
              <label>Loại giảm giá*</label>
              <select v-model="form.discountType" required>
                <option value="PERCENT">PERCENT (%)</option>
                <option value="FIXED">FIXED (VNĐ)</option>
              </select>
            </div>
          </div>

          <!-- Mô tả -->
          <div class="form-group">
            <label>Mô tả</label>
            <textarea
                v-model="form.description"
                rows="2"
                placeholder="Mô tả ngắn cho voucher (ví dụ: Giảm 20% tối đa 50k cho mọi đơn hàng)"
            ></textarea>
          </div>

          <!-- Value -->
          <div class="form-row">
            <div class="form-group">
              <label>Giá trị giảm*</label>
              <input type="number" v-model.number="form.discountValue" required />
            </div>

            <div class="form-group">
              <label>Giảm tối đa</label>
              <input type="number" v-model.number="form.maxDiscount" />
            </div>
          </div>

          <!-- Min, Limit -->
          <div class="form-row">
            <div class="form-group">
              <label>Đơn tối thiểu</label>
              <input type="number" v-model.number="form.minOrderValue" />
            </div>

            <div class="form-group">
              <label>Giới hạn lượt dùng</label>
              <input type="number" v-model.number="form.usageLimit" />
            </div>
          </div>

          <!-- Dates -->
          <div class="form-row">
            <div class="form-group">
              <label>Ngày bắt đầu</label>
              <input type="datetime-local" v-model="form.startDate" />
            </div>

            <div class="form-group">
              <label>Ngày kết thúc</label>
              <input type="datetime-local" v-model="form.endDate" />
            </div>
          </div>

          <!-- Active -->
          <div class="form-group form-group-inline">
            <label>Kích hoạt</label>
            <input type="checkbox" v-model="form.active" />
          </div>

          <div class="form-actions">
            <button
                type="button"
                class="btn-secondary"
                @click="closeModal"
            >
              Hủy
            </button>
            <button
                type="submit"
                class="btn-primary"
                :disabled="saving"
            >
              {{ saving ? "Đang lưu..." : "Lưu" }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useAdminVoucherStore } from "@/stores/adminVoucherStore";

const voucherStore = useAdminVoucherStore();

const vouchers = computed(() => voucherStore.vouchers);
const loading = computed(() => voucherStore.loading);

// Nếu trong store chưa tách saving riêng thì có thể tạm dùng ref
const saving = ref(false);

const isModalOpen = ref(false);
const modalMode = ref("add");

const form = ref({});

const emptyForm = {
  id: null,
  code: "",
  description: "",
  discountType: "PERCENT",
  discountValue: 0,
  minOrderValue: null,
  maxDiscount: null,
  startDate: "",
  endDate: "",
  usageLimit: null,
  active: true
};

onMounted(async () => {
  console.log("🔄 Fetch vouchers on mount");
  await voucherStore.fetchVouchers();
});

const openModal = (mode, voucher = null) => {
  modalMode.value = mode;

  if (mode === "edit" && voucher) {
    console.log("✏️ Edit voucher:", voucher);

    form.value = {
      id: voucher.id,
      code: voucher.code,
      description: voucher.description || "",
      discountType: voucher.discountType || "PERCENT",
      discountValue: voucher.discountValue,
      minOrderValue: voucher.minOrderValue,
      maxDiscount: voucher.maxDiscount,
      usageLimit: voucher.usageLimit,
      active: voucher.active,
      startDate: voucher.startDate ? voucher.startDate.substring(0, 16) : "",
      endDate: voucher.endDate ? voucher.endDate.substring(0, 16) : ""
    };
  } else {
    console.log("➕ Add new voucher");
    form.value = { ...emptyForm };
  }

  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const saveVoucher = async () => {
  try {
    saving.value = true;
    console.log("💾 Save voucher, mode =", modalMode.value, "form =", form.value);

    const payload = {
      ...form.value,
      startDate: form.value.startDate || null,
      endDate: form.value.endDate || null
    };

    if (modalMode.value === "add") {
      await voucherStore.addVoucher(payload);
    } else {
      if (!payload.id) {
        alert("Không có ID voucher để cập nhật");
        return;
      }
      await voucherStore.updateVoucher(payload.id, payload);
    }

    await voucherStore.fetchVouchers();
    closeModal();
  } catch (err) {
    console.error("❌ Lỗi saveVoucher:", err);
    alert("Có lỗi khi lưu voucher (xem console để biết chi tiết).");
  } finally {
    saving.value = false;
  }
};

const deleteVoucher = async (id) => {
  if (!confirm("Bạn chắc chắn muốn xóa voucher này?")) return;

  try {
    console.log("🗑️ Delete voucher id =", id);
    await voucherStore.deleteVoucher(id);
    await voucherStore.fetchVouchers();
  } catch (err) {
    console.error("❌ Lỗi deleteVoucher:", err);
    alert("Không thể xóa voucher (xem console để biết chi tiết).");
  }
};

const formatDate = (v) =>
    v ? new Date(v).toLocaleDateString("vi-VN") : "";

const formatPrice = (v) =>
    v ? v.toLocaleString("vi-VN") + "₫" : "0₫";
</script>

<style scoped>
/* ====== PAGE & LAYOUT (giống User Management) ====== */
.view-section {
  animation: fadeIn 0.5s ease-in-out;
}

.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.title-icon {
  font-size: 1.3rem;
  color: #4f46e5;
}

/* ====== BUTTONS (primary giống style admin đẹp) ====== */
.btn-primary {
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  opacity: 0.96;
  box-shadow: 0 7px 14px rgba(88, 80, 236, 0.35);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: #e5e7eb;
  color: #111827;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.15s ease;
}

.btn-secondary:hover {
  background: #d1d5db;
}

/* ====== TABLE ====== */
.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  font-size: 0.8rem;
  padding: 16px 24px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  text-transform: uppercase;
}

.data-table td {
  padding: 16px 24px;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  font-size: 0.9rem;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tr:hover td {
  background: #f8fafc;
}

.text-center {
  text-align: center;
}

/* Mô tả dài: cắt + tooltip title */
.desc-cell {
  max-width: 260px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ====== BADGES & STATUS ====== */
.badge {
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-block;
}

.badge-percent {
  background: #e0f2fe;
  color: #0369a1;
}

.badge-fixed {
  background: #fef3c7;
  color: #b45309;
}

.status-pill {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-pill.active {
  background: #dcfce7;
  color: #166534;
}

.status-pill.inactive {
  background: #fee2e2;
  color: #b91c1c;
}

/* ====== ACTION BUTTONS (icon style giống user) ====== */
.actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s, transform 0.1s ease;
  font-size: 0.85rem;
}

.btn-icon.edit {
  background: #eff6ff;
  color: #2563eb;
}

.btn-icon.edit:hover {
  background: #dbeafe;
}

.btn-icon.delete {
  background: #fef2f2;
  color: #ef4444;
}

.btn-icon.delete:hover {
  background: #fee2e2;
}

/* ====== MODAL ====== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15,23,42,0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  width: 92%;
  max-width: 600px;
  padding: 24px 24px 20px;
  border-radius: 16px;
  position: relative;
  animation: popIn 0.25s ease-out;
  box-shadow: 0 20px 45px rgba(15,23,42,0.35);
}

@keyframes popIn {
  from { transform: translateY(10px) scale(0.97); opacity: 0; }
  to   { transform: translateY(0) scale(1); opacity: 1; }
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
  font-size: 24px;
  cursor: pointer;
  color: #9ca3af;
  line-height: 1;
}

.close-btn:hover {
  color: #4b5563;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 18px;
  color: #111827;
}

/* ====== FORM ====== */
.voucher-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group-inline {
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 6px;
  color: #374151;
  font-size: 0.9rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 9px 11px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s;
}

.form-group textarea {
  resize: vertical;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 1px rgba(79,70,229,0.45);
  outline: none;
  background: #f9fafb;
}

/* ====== FORM BUTTONS ====== */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
}

/* ====== RESPONSIVE ====== */
@media (max-width: 768px) {
  .header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 96%;
  }

  .actions {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>

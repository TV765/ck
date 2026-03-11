<template>
  <div class="checkout-page">
    <h2>Thanh toán</h2>

    <div v-if="cartStore.items.length === 0" class="empty-cart">
      <p>Giỏ hàng trống, không thể thanh toán</p>
      <router-link to="/product" class="btn-primary">Tiếp tục mua sắm</router-link>
    </div>

    <div v-else class="checkout-container">
      <div class="order-summary">
        <h3>Đơn hàng của bạn</h3>
        <div class="order-items">
          <div v-for="item in cartStore.items" :key="item.id + '-' + item.sizeValue + '-' + item.colorName" class="order-item">
            <div class="item-info">
              <span class="item-name">{{ item.productName }}</span>
              <div class="item-details">
                <span v-if="item.colorName">Màu: {{ item.colorName }}</span>
                <span v-if="item.sizeValue">Size: {{ item.sizeValue }}</span>
                <span class="item-quantity">x {{ item.quantity }}</span>
              </div>
            </div>
            <span class="item-price">{{ formatPrice(item.price * item.quantity) }}</span>
          </div>
        </div>
        <div class="order-total">
          <div class="order-line">
            <span>Tạm tính:</span>
            <span>{{ formatPrice(cartStore.totalPrice) }}</span>
          </div>

          <div
              v-if="cartStore.discount > 0"
              class="order-line order-discount"
          >
            <span>Giảm giá:</span>
            <span>-{{ formatPrice(cartStore.discount) }}</span>
          </div>

          <div class="order-line order-final">
            <strong>Thành tiền:</strong>
            <strong>{{ formatPrice(cartStore.finalTotal) }}</strong>
          </div>

          <div
              v-if="cartStore.voucherCode"
              class="order-voucher"
          >
            <small>Mã áp dụng: {{ cartStore.voucherCode }}</small>
          </div>
        </div>
      </div>

      <form @submit.prevent="processOrder" class="checkout-form">
        <h3>Thông tin giao hàng</h3>

        <div class="form-group">
          <label>Họ và tên:</label>
          <input v-model="orderForm.fullName" type="text" required>
        </div>

        <div class="form-group">
          <label>Email:</label>
          <input v-model="orderForm.email" type="email" required>
        </div>

        <div class="form-group">
          <label>Số điện thoại:</label>
          <input v-model="orderForm.phone" type="tel" required>
        </div>

        <div class="form-group">
          <label>Địa chỉ:</label>
          <textarea v-model="orderForm.address" required></textarea>
        </div>

        <div class="form-group">
          <label>Ghi chú:</label>
          <textarea v-model="orderForm.notes" placeholder="Ghi chú thêm (không bắt buộc)"></textarea>
        </div>

        <div class="review">
          <h3>Đánh giá sản phẩm</h3>
          <div class="stars">
            <span
              v-for="n in 5"
              :key="n"
              class="star"
              :class="{ active: n <= stars }"
              @click="stars = n"
            >★</span>
          </div>
          <textarea v-model="comment" placeholder="Nhập bình luận..." rows="3" />
        </div>

        <div class="payment-methods">
          <h4>Phương thức thanh toán:</h4>
          <div class="payment-option">
            <input v-model="orderForm.paymentMethod" type="radio" id="cod" value="cod">
            <label for="cod">Thanh toán khi nhận hàng (COD)</label>
          </div>
          <div class="payment-option">
            <input v-model="orderForm.paymentMethod" type="radio" id="qr" value="qr">
            <label for="qr">Thanh toán QR Code</label>
          </div>
          <div class="payment-option">
            <input v-model="orderForm.paymentMethod" type="radio" id="card" value="card">
            <label for="card">Thẻ tín dụng/Ghi nợ</label>
          </div>
        </div>

        <div class="form-actions">
          <router-link to="/cart" class="btn-back">Quay lại giỏ hàng</router-link>
          <button type="submit" class="btn-order" :disabled="processing">
            {{ processing ? 'Đang xử lý...' : 'Đặt hàng' }}
          </button>
        </div>
      </form>
    </div>

    <QRPayment
      v-if="showQRPayment"
      :show="showQRPayment"
      :amount="cartStore.totalPrice"
      :order-id="currentOrderId"
      @close="handleQRClose"
      @payment-success="handlePaymentSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useCartStore } from '@/stores/cartStore';
import { useRouter } from 'vue-router';
import axios from 'axios';
import QRPayment from './QRPayment.vue';
import { exportInvoicePDF } from '../utils/invoiceExport.js';

const cartStore = useCartStore();
const router = useRouter();

const processing = ref(false);
const showQRPayment = ref(false);
const currentOrderId = ref('');
const stars = ref(0);
const comment = ref('');

const currentUser = computed(() => {
  try {
    const userStr = localStorage.getItem('userLogin') || localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    return null;
  }
});

const orderForm = ref({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  notes: '',
  paymentMethod: 'cod',
});

const formatPrice = (price) => {
  if (typeof price !== 'number') return '0 đ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const checkLoginStatus = () => {
  if (currentUser.value) {
    orderForm.value.fullName = currentUser.value.name || '';
    orderForm.value.email = currentUser.value.email || '';
    orderForm.value.phone = currentUser.value.phone || '';
    orderForm.value.address = currentUser.value.address || '';
  }
};

const getCommonOrderData = () => {
  return {
    fullName: orderForm.value.fullName,
    customerName: orderForm.value.fullName,
    email: orderForm.value.email,
    phoneNumber: orderForm.value.phone,
    address: orderForm.value.address,
    notes: orderForm.value.notes,

    userId: currentUser.value ? (currentUser.value.id || currentUser.value.userId) : null,
    status: 'PENDING',
    subtotal: cartStore.totalPrice,
    discount: cartStore.discount,
    voucherCode: cartStore.voucherCode || null,
    total: cartStore.finalTotal,

    orderItems: cartStore.items.map(item => ({
      productId: String(item.productId || item.id),
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
      colorName: item.colorName || "",
      sizeValue: item.sizeValue || ""
    })),

    rating: stars.value,
    comment: comment.value
  };
};

const processOrder = async () => {
  if (!currentUser.value) {
    alert('Vui lòng đăng nhập để thanh toán!');
    router.push('/login');
    return;
  }

  if (cartStore.items.length === 0) {
      alert('Giỏ hàng đang trống!');
      return;
  }
  if (
      !orderForm.value.fullName.trim() ||
      !orderForm.value.phone.trim() ||
      !orderForm.value.address.trim()
  ) {
    alert('Vui lòng điền đầy đủ thông tin giao hàng.');
    return;
  }

  processing.value = true;

  try {
    const orderData = getCommonOrderData();
    orderData.paymentMethod = orderForm.value.paymentMethod === 'qr' ? 'QR_CODE' : 'COD';

    const token = localStorage.getItem('authToken');
    const config = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    console.log('📤 Đang gửi đơn hàng:', orderData);

    const response = await axios.post('http://localhost:8082/api/orders', orderData, config);

    if (response.status === 200 || response.status === 201) {
        const savedOrder = response.data;
        console.log('✅ Tạo đơn thành công:', savedOrder);

        if (orderForm.value.paymentMethod === 'qr') {
            currentOrderId.value = String(savedOrder.id);
            showQRPayment.value = true;
        }
        else {
            // 🔥 TẠO DỮ LIỆU PDF CHUẨN (Lấy từ Form & Giỏ hàng)
            // Không dùng savedOrder.items vì server có thể chưa trả về kịp
            const invoiceData = {
                id: savedOrder.id,
                orderDate: new Date(),

                // 1. Lấy thông tin khách từ Form
                customerName: orderForm.value.fullName,
                phoneNumber: orderForm.value.phone,
                address: orderForm.value.address,

                // 2. Lấy sản phẩm + Màu/Size từ Giỏ hàng
                orderItems: cartStore.items.map(item => ({
                    productName: item.productName,
                    quantity: item.quantity,
                    price: item.price,
                    // Quan trọng: Truyền màu và size để in PDF
                    colorName: item.colorName,
                    sizeValue: item.sizeValue,
                    total_money: item.price * item.quantity
                })),

                total: cartStore.totalPrice
            };

            console.log("📄 Dữ liệu in PDF:", invoiceData);

            try {
                exportInvoicePDF(invoiceData);
            } catch (pdfError) {
                console.error("Lỗi in hóa đơn COD:", pdfError);
            }

            alert(`🎉 Đặt hàng thành công!\nMã đơn: ${savedOrder.id}\nHóa đơn đang được tải xuống...`);

            await cartStore.clearCart();
            router.push('/');
        }
    }

  } catch (error) {
    console.error('❌ Lỗi tạo đơn hàng:', error);
    alert('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng kiểm tra lại.');
  } finally {
    if (orderForm.value.paymentMethod !== 'qr') {
        processing.value = false;
    }
  }
};

const handlePaymentSuccess = async () => {
  showQRPayment.value = false;
  processing.value = false;
  await cartStore.clearCart();
  router.push('/');
};

const handleQRClose = () => {
  showQRPayment.value = false;
  processing.value = false;
};

onMounted(() => {
  checkLoginStatus();
  if (cartStore.items.length === 0) {
    cartStore.fetchCart();
  }
});
</script>

<style scoped>
.checkout-page {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.checkout-page h2 {
  margin-bottom: 30px;
  color: #333;
}

.empty-cart {
  text-align: center;
  padding: 50px;
  color: #666;
}

.checkout-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 40px;
}

@media (max-width: 768px) {
  .checkout-container {
    grid-template-columns: 1fr;
  }
  .form-actions {
    flex-direction: column;
  }
}

.order-summary {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  height: fit-content;
}

.order-summary h3 {
  margin-bottom: 20px;
  color: #333;
}

.order-items {
  margin-bottom: 20px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px 0;
  border-bottom: 1px solid #ddd;
}

.item-info {
  flex: 1;
}

.item-name {
  display: block;
  font-weight: 500;
  margin-bottom: 4px;
}

.item-details {
  font-size: 0.9em;
  color: #666;
}

.item-details span {
  margin-right: 10px;
}

.item-quantity {
  font-weight: bold;
}

.item-price {
  font-weight: bold;
  color: #b30404;
}

.order-total {
  padding-top: 15px;
  border-top: 2px solid #333;
  font-size: 1.2rem;
  color: #333;
}

.checkout-form {
  background: white;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #ddd;
}

.checkout-form h3 {
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical;
  height: 80px;
}

.payment-methods {
  margin-bottom: 30px;
}

.payment-methods h4 {
  margin-bottom: 15px;
  color: #333;
}

.payment-option {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.payment-option input {
  margin-right: 10px;
  width: auto;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: space-between;
}

.btn-primary,
.btn-order {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 5px;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.3s;
  display: inline-block;
  text-align: center;
}

.btn-primary:hover,
.btn-order:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-order:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.btn-back {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 5px;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.3s;
  text-align: center;
}

.btn-back:hover {
  background-color: #545b62;
}

.review {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: #f8f9fa;
}

.review h3 {
  margin-bottom: 15px;
  color: #333;
}

.stars {
  margin-bottom: 10px;
}

.stars .star {
  font-size: 24px;
  cursor: pointer;
  color: #ccc;
  margin-right: 5px;
  transition: color 0.2s;
}

.stars .star:hover {
  color: #ffd700;
}

.stars .star.active {
  color: #ffd700;
}

.review textarea {
  width: 100%;
  margin-top: 10px;
  resize: vertical;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  font-size: 14px;
}
</style>
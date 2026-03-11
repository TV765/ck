<template>
  <div class="auth-wrapper">
    <!-- Chỉ hiển thị toggle khi chưa đăng ký thành công -->
    <div class="auth-toggle" v-if="!hasRegistered && !registrationSuccess">
      <button :class="{ active: isLogin }" @click="isLogin = true">Đăng nhập</button>
      <button :class="{ active: !isLogin }" @click="isLogin = false">Đăng ký</button>
    </div>

    <!-- Form Đăng nhập - Luôn hiển thị sau khi đăng ký thành công -->
    <div v-if="isLogin || registrationSuccess" class="auth-form">
      <h2>{{ registrationSuccess ? 'Đăng nhập ngay' : 'Đăng nhập' }}</h2>
      <form @submit.prevent="login">
        <div class="form-group">
          <input 
            v-model="loginForm.email" 
            type="email" 
            placeholder="Email" 
            required 
            :disabled="loading"
          />
        </div>
        <div class="form-group">
          <input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="Mật khẩu" 
            required 
            :disabled="loading"
          />
        </div>
        <button type="submit" :disabled="loading" class="submit-btn">
          {{ loading ? 'Đang xử lý...' : 'Đăng nhập' }}
        </button>
        
        <!-- Quên mật khẩu -->
        <div class="forgot-password">
          <a href="#" @click.prevent="showForgotPassword = true">Quên mật khẩu?</a>
        </div>
      </form>
    </div>

    <!-- Form Đăng ký - Chỉ hiển thị khi chưa đăng ký thành công -->
    <div v-else class="auth-form">
      <h2>Đăng ký</h2>
      <form @submit.prevent="register">
        <div class="form-group">
          <input 
            v-model="registerForm.name" 
            placeholder="Tên người dùng" 
            required 
            :disabled="loading"
          />
        </div>
        <div class="form-group">
          <input 
            v-model="registerForm.email" 
            type="email" 
            placeholder="Email" 
            required 
            :disabled="loading"
          />
        </div>
        <div class="form-group">
          <input 
            v-model="registerForm.password" 
            type="password" 
            placeholder="Mật khẩu" 
            required 
            :disabled="loading"
            minlength="6"
          />
          <small class="password-hint">Mật khẩu ít nhất 6 ký tự</small>
        </div>
        <button type="submit" :disabled="loading" class="submit-btn">
          {{ loading ? 'Đang xử lý...' : 'Đăng ký' }}
        </button>
      </form>
    </div>

    <!-- Form Quên mật khẩu -->
    <div v-if="showForgotPassword" class="forgot-password-modal">
      <div class="modal-content">
        <h3>Quên mật khẩu</h3>
        <form @submit.prevent="forgotPassword">
          <div class="form-group">
            <input 
              v-model="forgotPasswordForm.email" 
              type="email" 
              placeholder="Email của bạn" 
              required 
              :disabled="loading"
            />
          </div>
          <div class="modal-actions">
            <button type="submit" :disabled="loading" class="submit-btn">
              {{ loading ? 'Đang gửi...' : 'Gửi link reset' }}
            </button>
            <button type="button" @click="showForgotPassword = false" class="cancel-btn">
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Hiển thị lỗi -->
    <div v-if="error" class="error-message">
      <span class="error-icon">⚠️</span>
      {{ error }}
    </div>

    <!-- Hiển thị thông báo thành công -->
    <div v-if="successMessage" class="success-message">
      <span class="success-icon">✅</span>
      {{ successMessage }}
    </div>

    <!-- Thông báo kết nối -->
    <div v-if="connectionStatus" class="connection-status">
      {{ connectionStatus }}
    </div>

    <!-- Debug info -->
    <div v-if="showDebugInfo" class="debug-info">
      <h4>Debug Info:</h4>
      <button @click="toggleDebug" class="debug-toggle">
        {{ showDebugInfo ? 'Ẩn' : 'Hiện' }} Debug
      </button>
      <div v-if="showDebugInfo">
        <p><strong>Backend URL:</strong> {{ API_BASE_URL }}</p>
        <p><strong>Connection:</strong> {{ connectionStatus }}</p>
        <p><strong>Last Request:</strong> {{ lastRequest }}</p>
        <p><strong>Last Response:</strong> {{ lastResponse }}</p>
        <p><strong>Last Error:</strong> {{ lastError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const isLogin = ref(true);
const hasRegistered = ref(false);
const registrationSuccess = ref(false); // 🔥 THÊM: Biến để theo dõi đăng ký thành công
const loading = ref(false);
const error = ref('');
const successMessage = ref('');
const connectionStatus = ref('');
const showForgotPassword = ref(false);
const showDebugInfo = ref(true);

// Debug info
const lastRequest = ref('');
const lastResponse = ref('');
const lastError = ref('');

// Forms
const loginForm = reactive({ email: '', password: '' });
const registerForm = reactive({ name: '', email: '', password: '' });
const forgotPasswordForm = reactive({ email: '' });

const router = useRouter();

// Base URL cho API
const API_BASE_URL = 'http://localhost:8082/api/auth';

const toggleDebug = () => {
  showDebugInfo.value = !showDebugInfo.value;
};

// Kiểm tra kết nối khi component mounted
onMounted(async () => {
  await testConnection();
});

// Test kết nối đến backend
const testConnection = async () => {
  try {
    connectionStatus.value = '🔄 Đang kiểm tra kết nối đến backend...';
    lastRequest.value = `GET ${API_BASE_URL}/check-email?email=test@test.com`;
    
    const response = await axios.get(`${API_BASE_URL}/check-email?email=test@test.com`, {
      timeout: 5000
    });
          // Giả lập gán token mặc định cho mục đích demo
        localStorage.setItem('authToken', 'TOKEN_MAC_DINH_DEMO_123456');
        
        
        console.log('✅ Đã gán token mặc định vào localStorage!');
    
        connectionStatus.value = '✅ Kết nối backend thành công!';
        lastResponse.value = JSON.stringify(response.data, null, 2);
        console.log('✅ Backend connection test:', response.data);
        
        
      } catch (err) {
        connectionStatus.value = '❌ Không thể kết nối đến backend!';
        lastError.value = err.message;
        console.error('❌ Backend connection failed:', err);
        
        // Tự động ẩn thông báo sau 5 giây
        setTimeout(() => {
          connectionStatus.value = '';
        }, 5000);
      }
    };
    
    // Đăng ký
    const register = async () => {
      loading.value = true;
      error.value = '';
      successMessage.value = '';
      lastError.value = '';
      lastResponse.value = '';
    
      const requestData = {
        name: registerForm.name.trim(),
        email: registerForm.email.toLowerCase().trim(),
        password: registerForm.password
      };
    
      try {
        console.log('📤 Sending register request to:', `${API_BASE_URL}/register`);
        console.log('📝 Register data:', requestData);
        
        lastRequest.value = `POST ${API_BASE_URL}/register\nData: ${JSON.stringify(requestData, null, 2)}`;
        
        const response = await axios.post(`${API_BASE_URL}/register`, requestData, {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json'
          }
        });
    
        console.log('✅ Register response:', response.data);
        lastResponse.value = JSON.stringify(response.data, null, 2);
    
        if (response.data.success) {
          successMessage.value = '🎉 Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.';
          registrationSuccess.value = true; // 🔥 ĐÁNH DẤU ĐĂNG KÝ THÀNH CÔNG
          isLogin.value = true; // 🔥 TỰ ĐỘNG CHUYỂN SANG ĐĂNG NHẬP
          
          // Điền email vào form đăng nhập
          loginForm.email = registerForm.email;
          
          // Reset form đăng ký
          registerForm.name = '';
          registerForm.email = '';
          registerForm.password = '';
          
          // Tự động ẩn thông báo sau 5 giây
          setTimeout(() => {
            successMessage.value = '';
          }, 5000);
          
        } else {
          error.value = response.data.message || 'Đăng ký thất bại';
        }
      } catch (err) {
        console.error('❌ Lỗi khi đăng ký:', err);
        lastError.value = `${err.message}\nCode: ${err.code}\nStatus: ${err.response?.status}`;
        handleError(err, 'đăng ký');
      } finally {
        loading.value = false;
      }
    };
    
    // Đăng nhập
    const login = async () => {
      loading.value = true;
      error.value = '';
      successMessage.value = '';
      lastError.value = '';
      lastResponse.value = '';
    
      const requestData = {
        email: loginForm.email.toLowerCase().trim(),
        password: loginForm.password
      };
    
      try {
        console.log('📤 Sending login request to:', `${API_BASE_URL}/login`);
        lastRequest.value = `POST ${API_BASE_URL}/login\nData: ${JSON.stringify(requestData, null, 2)}`;
        
        const response = await axios.post(`${API_BASE_URL}/login`, requestData, {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json'
          }
        });
    
        console.log('✅ Login response:', response.data);
        lastResponse.value = JSON.stringify(response.data, null, 2);
    
        if (response.data.success) {
          const user = response.data.user;
          
          // Lưu thông tin user vào localStorage
          localStorage.setItem('userLogin', JSON.stringify(user));
          localStorage.setItem('authToken', 'user-authenticated');
          
          successMessage.value = '🎉 Đăng nhập thành công!';
          
          // Chuyển hướng sau 1 giây
          setTimeout(() => {
            if (user.admin) {
              router.push('/admin');
            } else {
              router.push('/');
            }
          }, 1000);
          
        } else {      error.value = response.data.message || 'Đăng nhập thất bại';
    }
  } catch (err) {
    console.error('❌ Lỗi khi đăng nhập:', err);
    lastError.value = `${err.message}\nCode: ${err.code}\nStatus: ${err.response?.status}`;
    handleError(err, 'đăng nhập');
  } finally {
    loading.value = false;
  }
};

// Quên mật khẩu
const forgotPassword = async () => {
  loading.value = true;
  error.value = '';
  successMessage.value = '';
  lastError.value = '';
  lastResponse.value = '';

  try {
    console.log('📤 Sending forgot password request for:', forgotPasswordForm.email);
    lastRequest.value = `POST ${API_BASE_URL}/forgot-password?email=${forgotPasswordForm.email}`;
    
    const response = await axios.post(`${API_BASE_URL}/forgot-password?email=${forgotPasswordForm.email}`, {}, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Forgot password response:', response.data);
    lastResponse.value = JSON.stringify(response.data, null, 2);

    if (response.data.success) {
      successMessage.value = '📧 Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn.';
      showForgotPassword.value = false;
      forgotPasswordForm.email = '';
    } else {
      error.value = response.data.message || 'Không thể gửi email reset';
    }
  } catch (err) {
    console.error('❌ Lỗi khi gửi yêu cầu quên mật khẩu:', err);
    lastError.value = `${err.message}\nCode: ${err.code}\nStatus: ${err.response?.status}`;
    handleError(err, 'gửi yêu cầu quên mật khẩu');
  } finally {
    loading.value = false;
  }
};

// Xử lý lỗi chung
const handleError = (err, action) => {
  if (err.code === 'NETWORK_ERROR' || err.code === 'ECONNREFUSED') {
    error.value = `❌ Không thể kết nối đến server khi ${action}.\n\n` +
                 `Vui lòng kiểm tra:\n` +
                 `• Spring Boot có đang chạy trên port 8082?\n` +
                 `• Backend có bật CORS cho POST requests?\n` +
                 `• Kiểm tra console backend để xem lỗi`;
  } else if (err.response) {
    // Lỗi từ server (4xx, 5xx)
    const status = err.response.status;
    const data = err.response.data;
    
    if (status === 400) {
      error.value = data?.message || `Dữ liệu không hợp lệ`;
    } else if (status === 409) {
      error.value = 'Email đã tồn tại trong hệ thống';
    } else if (status === 401) {
      error.value = 'Email hoặc mật khẩu không đúng';
    } else if (status === 403) {
      error.value = 'Tài khoản chưa được xác thực email';
    } else if (status === 423) {
      error.value = 'Tài khoản tạm thời bị khóa do đăng nhập sai nhiều lần';
    } else if (status === 500) {
      error.value = 'Lỗi server nội bộ. Vui lòng thử lại sau.';
    } else {
      error.value = data?.message || `Lỗi server (${status})`;
    }
  } else if (err.request) {
    error.value = `⏰ Không nhận được phản hồi từ server khi ${action}.\n\n` +
                 `Có thể do:\n` +
                 `• CORS không cho phép POST requests\n` +
                 `• Backend bị crash khi xử lý request\n` +
                 `• Kiểm tra console backend`;
  } else {
    error.value = `⚠️ Lỗi không xác định khi ${action}: ${err.message}`;
  }
  
  // Tự động ẩn lỗi sau 8 giây
  setTimeout(() => {
    error.value = '';
  }, 8000);
};
</script>

<style scoped>
/* Giữ nguyên toàn bộ CSS như cũ */
.auth-wrapper {
  max-width: 420px;
  margin: 40px auto;
  padding: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
}

.auth-toggle {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
}

.auth-toggle button {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

.auth-toggle .active {
  background: #000;
  color: #fff;
}

.auth-form h2 {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
  font-weight: 600;
}

.form-group {
  margin-bottom: 20px;
  position: relative;
}

input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #000;
}

input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.password-hint {
  color: #6c757d;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background-color: #000;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  transition: background-color 0.3s ease;
  margin-top: 10px;
}

.submit-btn:hover:not(:disabled) {
  background-color: #333;
}

.submit-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.forgot-password {
  text-align: center;
  margin-top: 15px;
}

.forgot-password a {
  color: #007bff;
  text-decoration: none;
  font-size: 14px;
}

.forgot-password a:hover {
  text-decoration: underline;
}

/* Modal quên mật khẩu */
.forgot-password-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin-bottom: 20px;
  text-align: center;
  color: #333;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.modal-actions .submit-btn {
  flex: 2;
}

.cancel-btn {
  flex: 1;
  padding: 14px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.cancel-btn:hover {
  background: #5a6268;
}

/* Messages */
.error-message, .success-message, .connection-status {
  margin-top: 20px;
  padding: 15px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-line;
}

.error-message {
  color: #721c24;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
}

.success-message {
  color: #155724;
  background: #d4edda;
  border: 1px solid #c3e6cb;
}

.connection-status {
  color: #004085;
  background: #cce7ff;
  border: 1px solid #b3d7ff;
  text-align: center;
}

.error-icon, .success-icon {
  margin-right: 8px;
  font-size: 16px;
}

/* Debug info */
.debug-info {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 12px;
  color: #6c757d;
}

.debug-info h4 {
  margin: 0 0 8px 0;
  color: #495057;
}

.debug-toggle {
  background: #6c757d;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  margin-bottom: 10px;
}

.debug-info p {
  margin: 5px 0;
  word-break: break-all;
}

.debug-info pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

/* Responsive */
@media (max-width: 480px) {
  .auth-wrapper {
    margin: 20px;
    padding: 20px;
  }
  
  .modal-content {
    margin: 20px;
    width: calc(100% - 40px);
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>
<template>
    <div class="from-container">
        <div class="from-common login-container" v-if="loginPage">
            <div class="login-head">
                <el-image style="width: 80px; height: 80px" src="/support/loginlogo.png" fit="cover" />
                <div>
                    <p class="main-title">{{ hometitle.title.main }}</p>
                    <p class="sub-title">{{ hometitle.title.sub }}</p>
                </div>
            </div>
            <div style="margin-top: 15px">
                <el-form ref="login-form" :model="user" label-position="top" :rules="formLoginRules" hide-required-asterisk>
                    <el-form-item prop="account" label="账号">
                        <input class="large" id="account" type="text" v-model="user.account" />
                    </el-form-item>
                    <el-form-item prop="password" label="密码">
                        <input class="large" type="password" id="password" v-model="user.password" @keyup.enter="onEntrtLogin" />
                    </el-form-item>
                    <el-form-item style="margin-bottom: 0px">
                        <el-button size="large" style="width: 100%" type="primary" :loading="loginButton.loading" class="no-loading-icon" @click="onLogin">
                            {{ loginButton.text }}
                        </el-button>
                    </el-form-item>
                </el-form>
                <!-- 登录错误的提示消息 -->
                <div style="padding-top: 2px">
                    <el-text type="danger">{{ loginErrorMessage }}</el-text>
                </div>
            </div>
        </div>

        <div class="from-common two-factor-container" v-if="isTwoFactorPage">
            <div>
                <div class="two-factor-head">
                    <h3>登录验证</h3>
                </div>
                <el-form style="max-width: 600px" :model="twoFactorForm" label-width="auto" label-position="left">
                    <el-form-item label="验证方式">
                        <el-select v-model="twoFactorForm.device" placeholder="暂没有绑定验证方式">
                            <el-option v-for="(item, index) in twoFactor.device" :key="index" :label="item.title" :value="item.name" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="验证码" style="margin-bottom: 0px">
                        <el-input v-model="twoFactorForm.captcha" placeholder="请输入验证码" @input="handleInputChange">
                            <template #append v-if="twoFactorForm.device === 'email' || twoFactorForm.device === 'mobile'">
                                <el-button :disabled="buttonDisabled.GetCaptcha" @click="onSendCaptcha()">{{ buttonTitle.GetCaptcha }}</el-button>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="">
                        <div style="display: flex; justify-content: center; width: 100%">
                            <el-text :type="messages.type">{{ messages.text }}</el-text>
                        </div>
                    </el-form-item>
                </el-form>
                <div style="display: flex; justify-content: space-between; align-items: center">
                    <el-button style="width: 48%" @click="onSwitchAccount()">切换账号</el-button>
                    <el-button type="primary" style="width: 48%" :disabled="buttonDisabled.ContinueLogin" @click="onContinueLogin()">继续登录</el-button>
                </div>
            </div>
        </div>
    </div>

    <Footer />
</template>

<script>
import Footer from "../../../components/business/footer.vue";
import { withDelay } from "../../../utils/common.js";
import { setTitle } from "../../../utils/authui.js";
import { formatTime } from "../../../utils/date.js";
import { login, logout, GetBasicInfo, GetCaptcha, Verification } from "../../../api/index.js";
import { GetBasicFooter } from "../../../api/index.js";
import { ECODE } from "@/utils/eode";
import { KEY } from "../../../utils/envkey.js";

export default {
    name: "LoginIndex",
    components: { Footer },
    data() {
        return {
            user: {
                account: "",
                password: "",
            },
            // 表单验证规则配置
            formLoginRules: {
                account: [{ required: true, message: "请输入登录账号", trigger: ["blur", "change"] }],
                password: [{ required: true, message: "请输入密码", trigger: ["blur", "change"] }],
            },
            loginPage: true,
            isTwoFactorPage: false, // 二次验证
            twoFactor: {
                device: [],
            },
            twoFactorForm: {
                device: null,
                captcha: "",
            },
            buttonDisabled: {
                GetCaptcha: false,
                ContinueLogin: true,
            },
            buttonTitle: {
                GetCaptcha: "点击获取验证码",
            },
            messages: {
                type: "",
                text: "",
            },
            // 登录按钮
            loginButton: {
                text: "登录",
                loading: false,
            },
            loginErrorMessage: "",
            countdownTimer: null,
            hometitle: {
                title: {
                    main: "",
                    sub: "",
                },
            },
        };
    },
    methods: {
        onEntrtLogin(e) {
            // 回车登录
            if (e?.which !== 13 || this.loginButton.loading) return false;
            this.onLogin();
        },
        onLogin() {
            // 表单验证
            this.$refs["login-form"].validate((valid) => {
                if (!valid) return;
                this.$cookies.remove("session");
                this.Login();
            });
        },
        toRedirectPath() {
            // 登录后跳转到之前的页面
            const urlParams = new URLSearchParams(window.location.search);
            const redirectPath = urlParams.get("returnto");
            window.location.assign(decodeURIComponent(redirectPath || "/"));
            this.loginButton.loading = false;
        },
        Login() {
            // 登录请求
            this.loginErrorMessage = "";
            this.loginButton = { text: "请稍后", loading: true };

            const data = {
                uias: {
                    account: this.user.account.trim(), // 去掉输入框前后的空格
                    password: this.user.password.trim(),
                },
            };

            withDelay(() => login(data))
                .then((res) => {
                    if (res.payload.two_factor) {
                        // 二次验证
                        this.onSwitchFrom();
                        const device = res.payload.device;
                        device.forEach((item) => {
                            if (item.name === "email") item.title = `邮箱验证（${item.value}）`;
                            if (item.name === "mobile") item.title = `手机验证（${item.value}）`;
                            if (item.name === "vmfa") item.title = `VMFA验证`;
                        });
                        this.twoFactor.device = device;
                        this.twoFactorForm.device = device[0]?.name || null;
                    } else {
                        this.toRedirectPath(); // 不进行二次验证
                    }
                })
                .catch((err) => {
                    const { ecode } = err.metadata;
                    const { err_count, max_count, lock_duration, last_time } = err.payload;

                    if (ecode === ECODE.EcodeUserAuthenticationFailed) {
                        if (err_count < 2) {
                            this.loginErrorMessage = "账号或密码错误。";
                        } else if (max_count > err_count) {
                            this.loginErrorMessage = `账号或密码错误，再输错${max_count - err_count}次该账号将被锁定${lock_duration / 60}分钟。`;
                        } else if (max_count <= err_count) {
                            this.loginErrorMessage = `账号或密码错误，账号已锁定，请${lock_duration / 60}分钟后重试。`;
                        }
                    } else if (ecode === ECODE.EcodeLoginAttemptsExceeded) {
                        const unlockTime = formatTime(last_time + lock_duration * 1000, "YYYY年MM月DD日HH时mm分ss秒");
                        setTimeout(() => {
                            this.loginErrorMessage = `账号已锁定，请于${unlockTime}后重试。`;
                        }, 100);
                    } else {
                        this.loginErrorMessage = err.metadata.message;
                    }
                })
                .finally(() => {
                    this.loginButton = { text: "登录", loading: false };
                });
        },
        loadGetCaptcha() {
            // 获取验证码
            const params = { variety: this.twoFactorForm.device };
            GetCaptcha(params)
                .then((res) => {
                    this.messages = {
                        type: "success",
                        text: `验证码发送成功。验证码编号：${res.payload.captcha.serial}`,
                    };
                })
                .catch(() => {
                    this.messages = { type: "danger", text: "验证码发送失败，请稍后重试。" };
                });
        },
        loadVerification() {
            // 验证后继续登录
            const paths = { schema: this.twoFactorForm.device };
            const data = { captcha: this.twoFactorForm.captcha };
            Verification(paths, data)
                .then(() => {
                    this.messages = { type: "success", text: "验证成功，正在登录。" };
                    this.toRedirectPath();
                })
                .catch(() => {
                    this.twoFactorForm.captcha = "";
                    this.messages = { type: "danger", text: "验证码已失效，请点击重新获取。" };
                });
        },
        loadGetBasicInfo() {
            // 已登录直接跳转
            GetBasicInfo()
                .then(() => this.toRedirectPath())
                .catch(() => {});
        },
        loadGetBasicFooter() {
            // 获取页脚标题
            GetBasicFooter().then((res) => {
                this.hometitle = res.payload;
                window.localStorage.setItem(KEY.AUTHUI_WEB_BASIC_INFO, JSON.stringify(res.payload));
            });
        },
        onContinueLogin() {
            // 继续登录
            this.loadVerification();
        },
        onSendCaptcha() {
            this.buttonDisabled.GetCaptcha = true;
            this.startCountdown(60); // 倒计时功能，用于更新获取验证码按钮的提示信息
            this.loadGetCaptcha();
        },
        onSwitchAccount() {
            // 切换账号
            logout().finally(() => {
                this.$cookies.remove("session");
                this.loginPage = true;
                this.isTwoFactorPage = false;
                this.loginButton.loading = false;
            });
        },
        onSwitchFrom() {
            // 切换登录/二次验证页面
            this.loginPage = !this.loginPage;
            this.isTwoFactorPage = !this.isTwoFactorPage;
        },
        handleInputChange() {
            // 输入验证码控制按钮状态
            this.buttonDisabled.ContinueLogin = !this.twoFactorForm.captcha;
        },
        startCountdown(seconds = 60) {
            // 验证码倒计时
            if (seconds <= 0) {
                clearTimeout(this.countdownTimer);
                this.buttonDisabled.GetCaptcha = false;
                this.buttonTitle.GetCaptcha = "重新获取验证码";
                return;
            }
            this.buttonTitle.GetCaptcha = `${seconds}秒后重新获取`;
            this.countdownTimer = setTimeout(() => {
                this.startCountdown(seconds - 1);
            }, 1000);
        },
    },
    created() {
        const str = window.localStorage.getItem(KEY.AUTHUI_WEB_BASIC_INFO);
        this.hometitle = str ? JSON.parse(str) : { title: { main: "登录数据系统", sub: "" } };
        setTitle("用户登录");
        this.loadGetBasicInfo();
        this.loadGetBasicFooter();
    },
};
</script>

<style>
.from-container {
    padding-top: 16px;
    display: flex;
    justify-content: center;
    align-items: stretch;
}

.from-common {
    padding: 20px;
    margin-bottom: 100px;
}

.login-head {
    text-align: center;
    color: var(--text-color-primary);
}

.login-head p {
    margin-bottom: 0;
}

/* 主标题 */
.main-title {
    font-size: 1.4em;
    font-weight: bold;
    margin: 12px 0 8px;
    color: #333;
}

/* 副标题 */
.sub-title {
    font-size: 1em;
    font-weight: normal;
    margin: 5px 0 0;
    color: #666;
}

/* 移动端字体大小 */
@media (max-width: 768px) {
    .main-title {
        font-size: 1.2em;
    }
    .sub-title {
        font-size: 0.9em;
    }
}

.login-container {
    width: 24rem;
    background-color: rgba(255, 255, 255, 1);
}

/* 不显示loading图标 */
.no-loading-icon .el-icon {
    display: none;
}

.two-factor-head {
    padding: 24px;
}

.two-factor-head h3 {
    color: #3d3f41;
}

.two-factor-container {
    width: 400px;
}

.two-factor-container h3 {
    text-align: center;
}
</style>

<template>
    <div class="from-container">
        <div class="from-common login-container" v-if="loginPage">
            <div class="login-head">
                <el-image style="width: 80px; height: 80px" src="/support/loginlogo.png" fit="cover" />
                <h3 style="margin-bottom: 0px; margin-top: 15px; letter-spacing: 1px; word-spacing: 2px">登录数据平台</h3>
            </div>
            <el-form ref="login-form" :model="user" label-position="top" :rules="formLoginRules" hide-required-asterisk>
                <el-form-item prop="account" label="账号">
                    <input class="large" id="account" type="text" v-model="user.account" />
                </el-form-item>
                <el-form-item prop="password" label="密码">
                    <input class="large" type="password" id="password" v-model="user.password" @keyup.enter="onEntrtLogin" />
                </el-form-item>
                <el-form-item style="margin-bottom: 0px">
                    <el-button size="large" style="width: 100%" type="primary" :loading="loginLoading" @click="onLogin">登录</el-button>
                </el-form-item>
            </el-form>
            <!-- 登录错误的提示消息 -->
            <div style="height: 25px; display: flex; align-items: center">
                <el-text type="danger">{{ loginErrorMessage }}</el-text>
            </div>
            <div style="float: right; padding-right: 20px">
                <el-link href="/authui/forgetpwd.html" target="_blank">忘记密码</el-link>
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

    <!-- 页脚区域 -->
    <div class="footer">
        <div class="footer-content">
            <ul class="footer-list">
                <li v-if="isFooterEmptyObj(footer.company)">
                    <span>{{ copyright }}</span>
                </li>
                <li v-if="isFooterEmptyObj(footer.beian)">
                    <a :href="footer.beian.href" target="_blank">{{ footer.beian.title }}</a>
                </li>
                <li v-if="isFooterEmptyObj(footer.privacy)">
                    <a :href="footer.privacy.href" target="_blank">{{ footer.privacy.title }}</a>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import { setTitle } from "@/utils/authui.js";
import { formatTime, getTimeDiff } from "../../../utils/date.js";
import { ECODE } from "@/utils/eode";
import { ElMessage } from "element-plus";
import { login, logout, GetBasicInfo, GetCaptcha, Verification, GetBasicFooter } from "@/api/index.js";
export default {
    name: "LoginIndex",
    components: {},
    props: {},
    data() {
        return {
            loginLoading: false, // 登录的 loading 状态
            user: {
                // 登录名,密码
                account: "",
                password: "",
            },
            // 表单验证规则配置
            formLoginRules: {
                account: [{ required: true, type: "string", message: "请输入登录账号", trigger: ["blur", "change"] }],
                password: [{ required: true, type: "string", message: "请输入密码", trigger: ["blur", "change"] }],
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
            loginErrorMessage: "",
            countdownTimer: null, // 全局变量来存储定时器ID
            //页脚内容
            footer: {
                company: "",
                beian: {},
                privacy: {},
            },
        };
    },
    computed: {
        copyright() {
            const currentYear = new Date().getFullYear();
            return `© ${currentYear} ${this.footer.company} 版权所有`;
        },
    },
    watch: {},
    created() {
        setTitle("用户登录");
        this.loadGetBasicInfo();
        this.loadGetBasicFooter();
    },
    mounted() {},
    methods: {
        isFooterEmptyObj(obj) {
            // 非空返回true
            if (typeof obj === "string") {
                return obj.trim().length > 0;
            }
            if (typeof obj === "object" && obj !== null) {
                return obj && Object.keys(obj).length > 0 && "title" in obj && "href" in obj && obj.title !== "";
            }
            return false;
        },
        onEntrtLogin(e) {
            if (e != null && e.which != 13) {
                return false;
            }
            this.onLogin();
        },
        onLogin() {
            // 表单验证， validate 方法是异步的,获取表单数据（根据接口要求绑定数据）
            // this.loginPage = false
            // this.isTwoFactorPage = true
            this.$refs["login-form"].validate((valid) => {
                if (!valid) {
                    return;
                }
                this.$cookies.remove("session");
                this.Login(); // 验证通过，请求登录
            });
        },
        toRedirectPath: function () {
            // 登录后跳转到之前的页面，以下这种写法哈希模式路由不支持。
            const urlParams = new URLSearchParams(window.location.search);
            const redirectPath = urlParams.get("returnto");
            if (redirectPath) {
                window.location.assign(decodeURIComponent(redirectPath));
                this.loginLoading = false;
            } else {
                window.location.assign("/");
                this.loginLoading = false;
            }
        },
        Login: function () {
            // 表单验证通过，提交登录
            this.loginLoading = true;
            const data = {
                uias: {
                    account: this.user.account.trim(), // 去掉输入框前后的空格
                    password: this.user.password.trim(),
                },
            };
            login(data)
                .then((res) => {
                    if (res.payload.two_factor) {
                        // 要二次验证
                        this.onSwitchFrom();
                        const device = res.payload.device;
                        device.map((item) => {
                            if (item.name === "email") {
                                item["title"] = `邮箱验证（${item.value}）`;
                            }
                            if (item.name === "mobile") {
                                item["title"] = `手机验证（${item.value}）`;
                            }
                            if (item.name === "vmfa") {
                                item["title"] = `VMFA验证`;
                            }
                            if (this.twoFactorForm.device === null) {
                                this.twoFactorForm.device = item.name;
                            }
                        });
                        this.twoFactor.device = device;
                    } else {
                        this.toRedirectPath(); // 不进行二次验证
                    }
                })
                .catch((err) => {
                    console.log(err);
                    this.loginLoading = false;
                    this.loginErrorMessage = err.metadata.message;
                    let ecode = err.metadata.ecode;
                    let err_count = err.payload.err_count;
                    let max_count = err.payload.max_count;
                    let lock_duration = err.payload.lock_duration;
                    let last_time = err.payload.last_time;
                    if (ecode === ECODE.EcodeUserAuthenticationFailed) {
                        if (err_count < 2) {
                            this.loginErrorMessage = `账号或密码错误`;
                            return;
                        }
                        if (max_count > err_count && err_count >= 2) {
                            this.loginErrorMessage = `账号或密码错误，再输错${max_count - err_count}次该账号将被锁定${lock_duration / 60}分钟。`;
                        } else if (max_count === err_count) {
                            this.loginErrorMessage = `账号已锁定，请${lock_duration / 60}分钟后重试。`;
                        } else {
                            this.loginErrorMessage = `账号或密码错误，请${lock_duration / 60}分钟后重试。`;
                            return;
                        }
                    }

                    if (ecode === ECODE.EcodeLoginAttemptsExceeded) {
                        // 账号锁定

                        let time = formatTime(last_time + lock_duration * 1000, "YYYY年MM月DD日HH时mm分ss秒");
                        let tdiff = getTimeDiff(last_time + lock_duration * 1000);
                        let msg = `账号已锁定，请于${time}后重试。`;
                        ElMessage({
                            message: msg,
                            type: "error",
                            duration: 3000,
                            plain: true,
                            grouping: true,
                            showClose: true,
                        });
                        this.loginErrorMessage = `剩余等候时间：${tdiff}`;
                    }
                });
        },
        loadGetCaptcha: function () {
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
                    this.messages = {
                        type: "danger",
                        text: "验证码发送失败，请稍后重试。",
                    };
                });
        },
        loadVerification: function () {
            // 验证后继续登录
            const paths = { schema: this.twoFactorForm.device };
            const data = { captcha: this.twoFactorForm.captcha };
            Verification(paths, data)
                .then(() => {
                    this.messages = {
                        type: "success",
                        text: "验证成功，正在登录。",
                    };
                    this.toRedirectPath();
                })
                .catch(() => {
                    this.twoFactorForm.captcha = "";
                    this.messages.type = "danger";
                    this.messages.text = "验证码已失效，请点击重新获取。";
                });
        },
        loadGetBasicInfo: function () {
            GetBasicInfo()
                .then(() => {
                    // 如果用户已经登录过直接跳转到控制台。
                    this.toRedirectPath();
                })
                .catch(() => {});
        },
        loadGetBasicFooter: function () {
            GetBasicFooter().then((res) => {
                this.footer = res.payload;
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
            logout()
                .then(() => {
                    this.$cookies.remove("session");
                })
                .catch(() => {
                    this.$cookies.remove("session");
                });
            this.loginPage = true;
            this.isTwoFactorPage = false;
            this.loginLoading = false;
        },
        onSwitchFrom() {
            if (this.loginPage) {
                this.loginPage = false;
                this.isTwoFactorPage = true;
            } else {
                this.loginPage = true;
                this.isTwoFactorPage = false;
            }
        },
        handleInputChange() {
            // 验证码输入框在 Input 值改变时触发
            // 输入验证码，启用继续登录按钮，删除验证码，禁用继续登录按钮
            let value = this.twoFactorForm.captcha;
            if (value != "") {
                this.buttonDisabled.ContinueLogin = false;
            } else {
                this.buttonDisabled.ContinueLogin = true;
            }
        },
        startCountdown(seconds = 60) {
            if (seconds <= 0) {
                clearInterval(this.countdownTimer); // 清除定时器
                this.buttonDisabled.GetCaptcha = false; // 启用按钮
                this.buttonTitle.GetCaptcha = "重新获取验证码"; // 恢复按钮文本
                return;
            }
            this.buttonTitle.GetCaptcha = `${seconds}秒后重新获取`;
            this.countdownTimer = setTimeout(() => {
                this.startCountdown(seconds - 1);
            }, 1000);
        },
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
}

.login-head {
    text-align: center;
    h3 {
        color: var(--text-color-primary);
    }
}

.login-container {
    width: 24rem;
    background-color: rgba(255, 255, 255, 1);
}

.two-factor-head {
    display: flex;
    justify-content: center;
    h3 {
        color: #3d3f41;
    }
}

.two-factor-container {
    width: 400px;
    h3 {
        text-align: center;
    }
}

/* 页脚 */
.footer {
    width: 100%;
    margin-top: 65px;
    background-color: #f6f8fa;
    position: absolute;
    bottom: 0;
    width: 100%;
}

.footer-content {
    text-align: center;
    color: var(--footer-color-text);
    font-size: 0.75rem;
    padding: 16px 0px;
}

.footer-content a {
    color: var(--footer-color-text);
    text-decoration: none;
}

.footer-content a:hover {
    color: var(--footer-color-link);
    text-decoration-line: underline;
    text-underline-offset: 4px;
}

.footer-list {
    display: flex;
    justify-content: center;
    list-style: none;
    gap: 16px;
}

@media (max-width: 768px) {
    .footer-list {
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }
}
</style>

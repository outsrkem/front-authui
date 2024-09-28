<template>
    <div class="bg-image"></div>
    <!-- <el-button link type="primary" @click="onSwitchFrom()">切换</el-button> -->
    <div class="from-container">
        <div class="from-common login-container" v-if="loginPage">
            <div class="login-head">
                <h3>帐号登录</h3>
            </div>
            <el-form ref="login-form" :model="user" :rules="formLoginRules">
                <el-form-item prop="account">
                    <el-input v-model="user.account" clearable placeholder="请输入登录名" />
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="user.password" clearable show-password placeholder="请输入密码" @keyup.enter="onEntrtLogin" />
                </el-form-item>
                <el-form-item>
                    <el-button style="width: 100%" type="primary" :loading="loginLoading" @click="onLogin">登录</el-button>
                </el-form-item>
            </el-form>
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
                    <el-button type="primary" style="width: 48%" :disabled="buttonDisabled.ContinueLogin" @click="onContinueLogin()"
                        >继续登录</el-button
                    >
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { setTitle } from "@/utils/authui.js";
import { login, logout, GetBasicInfo, GetCaptcha, Verification } from "@/api/index.js";
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
                account: [{ required: true, type: "string", message: "请输入用户名", trigger: ["blur", "change"] }],
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
            countdownTimer: null, // 全局变量来存储定时器ID
        };
    },
    computed: {},
    watch: {},
    created() {
        setTitle("用户登录");
        this.loadGetBasicInfo();
    },
    mounted() {},
    methods: {
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
                    account: this.user.account,
                    password: this.user.password.trim(), // 去掉输入框前后的空格
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
                    this.loginLoading = false;
                    let msg = err.metadata.message;
                    this.$notify({ duration: 2000, title: "登录失败", message: msg, type: "error" });
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
body,
html {
    height: 100%;
    margin: 0;
    font-family: Arial, sans-serif;
}

h2 {
    text-align: center;
}
.bg-image {
    background: url("./login_bg.png");
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    filter: blur(8px);
    -webkit-filter: blur(8px);
    position: fixed;
    /* height: 100%; */
    /* width: 100%; */
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: -1;
}
.from-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    /* padding: 15%; */
    height: 80vh;
}
.from-common {
    padding: 20px;
    background-color: #ffffff;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.login-head {
    display: flex;
    justify-content: center;
    h3 {
        color: #3d3f41;
    }
}
.login-container {
    width: 300px;
    position: relative;
    background-color: rgba(255, 255, 255, 0.5);
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
    /* padding-left: 100px; */
    /* padding-right: 100px; */
    h3 {
        text-align: center;
    }
}
</style>

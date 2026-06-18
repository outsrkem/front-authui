<template>
    <div style="display: flex; justify-content: center">
        <div class="container">
            <div class="content">
                <h4>重置密码</h4>
                <div class="hint-message">
                    <el-text :type="messages.type">{{ messages.text }}</el-text>
                </div>
                <div>
                    <el-form :model="inputFrom" label-width="auto" label-position="top" ref="formRef" :rules="formRules">
                        <el-form-item label="输入账号名" prop="account">
                            <el-input ref="accountInput" v-model="inputFrom.account" />
                        </el-form-item>
                        <el-form-item label="输入账号绑定的邮箱" prop="email">
                            <el-input ref="emailInput" v-model="inputFrom.email" />
                        </el-form-item>
                        <el-form-item label="输入验证码" prop="captcha">
                            <div style="width: 100%; display: flex; gap: 12px; align-items: center">
                                <div style="flex: 1">
                                    <el-input v-model="inputFrom.captcha" :placeholder="serial" />
                                </div>
                                <div style="min-width: 150px">
                                    <el-button style="width: 100%" :disabled="buttonDisabled.GetCaptcha" @click="onSendCaptcha()">
                                        {{ buttonTitle.GetCaptcha }}
                                    </el-button>
                                </div>
                            </div>
                        </el-form-item>
                        <!-- Disable automatic password filling -->
                        <input id="fakeUserName" type="text" class="fake-input" />
                        <input id="fakePassword" type="password" class="fake-input" />
                        <el-form-item label="输入一个新密码" prop="passwd0">
                            <el-input v-model="inputFrom.passwd0" clearable show-password auto-complete="new-password" />
                        </el-form-item>
                        <el-form-item label="请再次输入新密码" prop="passwd1">
                            <el-input v-model="inputFrom.passwd1" clearable show-password auto-complete="new-password" />
                        </el-form-item>
                        <div class="submit-box">
                            <el-button class="submit-btn" type="success" @click="onToLogin()">去登录</el-button>
                            <el-button class="submit-btn" type="primary" @click="onSetPasswd()">确定重置</el-button>
                        </div>
                    </el-form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { setTitle } from "@/utils/authui.js";
import { Gcode, SetPwd } from "@/api/index.js";
export default {
    name: "FpwdIndex",
    data() {
        return {
            inputFrom: {
                account: "",
                email: "",
                captcha: "",
                passwd0: "",
                passwd1: "",
            },
            serial: "",
            formRules: {
                account: [{ required: true, type: "string", message: "请输入账号名", trigger: ["blur", "change"] }],
                email: [
                    { required: true, message: "请输入邮箱", trigger: "blur" },
                    { type: "email", message: "邮箱格式错误", trigger: ["blur", "change"] },
                ],
                captcha: [
                    { required: true, message: "请输入验证码", trigger: "blur" },
                    { pattern: /^[0-9]{6}$/, message: "6位数字验证码", trigger: ["blur", "change"] },
                ],
                passwd0: [{ required: true, type: "string", message: "输入一个新密码", trigger: ["blur", "change"] }],
                passwd1: [{ required: true, type: "string", message: "请再次输入新密码", trigger: ["blur", "change"] }],
            },
            buttonTitle: {
                GetCaptcha: "点击获取验证码",
            },
            buttonDisabled: {
                GetCaptcha: false,
                ContinueLogin: true,
            },
            messages: {
                type: "",
                text: "忘记密码后可以设置新密码登录。",
            },
        };
    },
    methods: {
        loadGetCaptcha: function () {
            const data = {
                account: this.inputFrom.account,
                email: this.inputFrom.email,
            };
            Gcode(data)
                .then((res) => {
                    this.messages = {
                        type: "success",
                        text: "验证码发送成功。",
                    };
                    this.serial = `验证码编号：${res.payload.captcha.serial}`;
                })
                .catch((err) => {
                    console.log(err);
                    this.messages = {
                        type: "danger",
                        text: err.metadata.message,
                    };
                });
        },
        loadSetPwd: function (data) {
            SetPwd(data)
                .then(() => {
                    this.messages = {
                        type: "success",
                        text: "设置成功，去登录页登录。",
                    };
                    this.$confirm("重置密码成功，去登陆。", {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                        type: "warning",
                    })
                        .then(() => {
                            window.location.href = "/authui/login.html";
                        })
                        .catch(() => {});
                })
                .catch((err) => {
                    console.log(err);
                    this.messages = {
                        type: "danger",
                        text: err.metadata.message,
                    };
                });
        },
        async onSetPasswd() {
            const valid = await this.$refs["formRef"].validate();
            if (!valid) return;

            const data = {
                account: this.inputFrom.account,
                email: this.inputFrom.email,
                captcha: this.inputFrom.captcha,
                passwd: this.inputFrom.passwd0,
            };
            if (this.inputFrom.passwd0 !== this.inputFrom.passwd1) {
                this.messages = {
                    type: "danger",
                    text: "两次输入的密码不一致",
                };
                return;
            }
            this.loadSetPwd(data);
        },
        onToLogin() {
            window.location.href = "/authui/login.html";
        },
        onSendCaptcha() {
            this.buttonDisabled.GetCaptcha = true;
            this.startCountdown(60);
            this.loadGetCaptcha();
        },
        startCountdown(seconds = 60) {
            if (seconds <= 0) {
                clearInterval(this.countdownTimer); // Clear timer task
                this.buttonDisabled.GetCaptcha = false; // Enable button
                this.buttonTitle.GetCaptcha = "重新获取验证码"; // Reset button text
                return;
            }
            this.buttonTitle.GetCaptcha = `${seconds}秒后重新获取`;
            this.countdownTimer = setTimeout(() => {
                this.startCountdown(seconds - 1);
            }, 1000);
        },
    },
    created() {
        setTitle("重置密码");
    },
};
</script>

<style scoped lang="less">
.container {
    width: 360px;
}

.content {
    border-radius: 3px;
    padding: 5px;
}

@media (max-width: 600px) {
    .container {
        width: 100%;
        padding: 0;
    }
}

.hint-message {
    background-color: #eef6ff;
    padding: 7px 16px;
    border-radius: 3px;
    margin-bottom: 10px;
}
.submit-box {
    margin-top: 12px;
    display: flex;
    gap: 8px;
}
.submit-btn {
    flex: 1;
}
.fake-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    padding: 0;
    border: none;
}
</style>

<template>
    <div class="container" style="">
        <div class="content" style="">
            <h4>忘记密码</h4>
            <div class="hint-message">
                <el-text>
                    <span style="margin-left: 5px">{{ messages.text }}</span>
                </el-text>
            </div>
            <div>
                <el-form :model="inputFrom" label-width="auto" label-position="top" :rules="formRules">
                    <el-form-item label="输入账号名" prop="account">
                        <el-input v-model="inputFrom.account" />
                    </el-form-item>
                    <el-form-item label="输入账号绑定的邮箱" prop="email">
                        <el-input v-model="inputFrom.email" />
                    </el-form-item>
                    <el-form-item label="输入验证码" prop="captcha">
                        <el-input v-model="inputFrom.captcha" @input="submitForm()">
                            <template #append>
                                <el-button :disabled="buttonDisabled.GetCaptcha" @click="onSendCaptcha()">{{ buttonTitle.GetCaptcha }}</el-button>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="输入一个新密码" prop="passwd0">
                        <el-input v-model="inputFrom.passwd0" clearable show-password />
                    </el-form-item>
                    <el-form-item label="请再次输入新密码" prop="passwd1">
                        <el-input v-model="inputFrom.passwd1" clearable show-password />
                    </el-form-item>
                    <div style="float: right; padding-right: 20px">
                        <el-button type="primary" @click="onSetPasswd()">确定</el-button>
                    </div>
                </el-form>
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
            formRules: {
                account: [{ required: true, type: "string", message: "请输入账号名", trigger: ["blur", "change"] }],
                email: [
                    { required: true, message: "请输入邮箱", trigger: "blur" },
                    { type: "email", message: "邮箱格式不正确", trigger: ["blur", "change"] },
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
                        text: `验证码发送成功。验证码编号：${res.payload.captcha.serial}`,
                    };
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
        onSetPasswd() {
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
        onSendCaptcha() {
            this.buttonDisabled.GetCaptcha = true;
            this.startCountdown(60); // 倒计时功能，用于更新获取验证码按钮的提示信息
            this.loadGetCaptcha();
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
    created() {
        setTitle("重置密码");
    },
};
</script>

<style scoped lang="less">
.container {
    display: flex;
    justify-content: center;
}
.content {
    // text-align: center;
    box-shadow: 0 0px 2px rgba(0, 0, 0, 0.1);
    margin-left: 0px;
    max-width: 380px;
    border-radius: 3px;
    padding: 12px;
}

@media (max-width: 600px) {
    .content {
        padding: 0px;
        max-width: 100%;
    }
}

.hint-message {
    background-color: #deecff;
    padding-top: 7px;
    padding-bottom: 7px;
    border-radius: 8px;
    padding-left: 16px;
    padding-right: 16px;
    margin-bottom: 10px;
}
</style>

<template>
    <div class="login-container" v-if="loginPage">
        <div class="login-head">
            <h3>帐号登录</h3>
        </div>
        <el-form ref="login-form" :model="user" :rules="formLoginRules">
            <el-form-item prop="account">
                <el-input v-model="user.account" clearable placeholder="请输入登录名"/>
            </el-form-item>
            <el-form-item prop="password">
                <el-input v-model="user.password" clearable show-password placeholder="请输入密码"/>
            </el-form-item>
            <el-form-item>
                <el-button style="width: 100%;" type="primary" :loading="loginLoading" @click="onLogin">登录</el-button>
            </el-form-item>
        </el-form>
    </div>
    <div class="two-factor-container" v-if="isTwoFactorPage">
        <div >
            <h3>登录验证</h3>
            <el-form  style="max-width: 600px" :model="twoFactorForm"  label-width="auto" label-position="left">
                <el-form-item label="验证方式">
                    <el-segmented v-model="twoFactorForm.device" :options="twoFactor.device"/>
                </el-form-item>
                <el-form-item label="绑定邮箱">
                    <span>9***.qq.com</span>
                </el-form-item>
                <el-form-item label="验证码">
                    <el-input v-model="twoFactorForm.captcha">
                        <template #append>
                            <el-button>获取验证码</el-button>
                        </template>
                    </el-input>
                </el-form-item>
            </el-form>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <el-button type="primary" style="width: 48%;" @click="onSwitchAccount">切换账号</el-button>
                <el-button type="primary" style="width: 48%;">继续登录</el-button>
            </div>
        </div>
    </div>
</template>

<script>
import { setTitle } from '@/utils/authui.js';
import {
    login,
    logout
} from '@/api/index.js'
export default {
    name: 'LoginIndex',
    components: {},
    props: {},
    data () {
        return {
            loginLoading: false, // 登录的 loading 状态
            user: { // 登录名,密码
                account: '',
                password: '' 
            },
            // 表单验证规则配置
            formLoginRules: {
                account: [{ required: true, type: 'string', message: '请输入用户名', trigger: ['blur', 'change'] }],
                password: [{ required: true, type: 'string', message: '请输入密码', trigger: ['blur', 'change'] }],
            },
            loginPage: true,
            isTwoFactorPage: false, // 二次验证
            twoFactor: {
                device: [
                    { label: '邮箱验证', value: 'email' },
                    { label: '手机验证', value: 'mobile' },
                    { label: 'VMFA验证', value: 'vmfa' },
                ],
            },
            twoFactorForm: {
                device: '',
                captcha: '',
                
            },
        }
    },
    computed: {},
    watch: {},
    created() {
        setTitle('用户登录');
    },
    mounted () {
    },
    methods: {
        onLogin() {
            // 表单验证， validate 方法是异步的,获取表单数据（根据接口要求绑定数据）
            // this.loginPage = false
            // this.isTwoFactorPage = true
            this.$refs['login-form'].validate(valid => {
                if (!valid) {
                    return
                }
                this.Login()// 验证通过，请求登录
            })
        },
        toRedirectPath: function() {
            // 登录后跳转到之前的页面，以下这种写法哈希模式路由不支持。
            const urlParams = new URLSearchParams(window.location.search);
            const redirectPath = urlParams.get('returnto');
            if (redirectPath) {
                window.location.assign(decodeURIComponent(redirectPath))
                this.loginLoading = false
            } else {
                window.location.assign('/')
                this.loginLoading = false
            }
        },
        Login: function () {
            // 表单验证通过，提交登录
            this.loginLoading = true
            const data = {"uias": this.user}
            login(data).then((res) => {
                // if (res.meta_info.res_msg.payload.two_factor) { // 要二次验证
                //     this.isTwoFactorPage = true;
                //     console.log(this.isTwoFactorPage)
                // } else {
                //     this.toRedirectPath()  // 不进行二次验证
                // }
                console.log(res)
                this.toRedirectPath()
            }).catch(err => {
                this.loginLoading = false
                this.$notify({ duration: 2000, title: '登录失败', message: err, type: 'error' })
            })
        },
        onSwitchAccount() {
            this.$cookies.remove('session');
            logout().then(() => { }).catch(() => { })
            this.loginPage = true
            this.isTwoFactorPage = false
        }
    }
}
</script>


<style>

    body {
        height: 100%;
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
        background-color: #dde2e7;
    }

    h2 {
        text-align: center;
    }
    .login-container{
        width: 300px;
        margin: 10% auto;
        padding: 20px;
        background-color: #FFFFFF;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
    .login-head {
        display: flex;
        justify-content: center;
        h3 {
            color: #3d3f41;
        }
    }
    .two-factor-container{
        width: 400px;
        margin: 10% auto;
        padding: 20px;
        padding-left: 100px;
        padding-right: 100px;
        background-color: #ffffff;
        border: 1px solid #ffffff;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        h3 {
            text-align: center;
        }
    }
</style>

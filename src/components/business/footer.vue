<template>
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
                <li v-if="isFooterEmptyObj(footer.forgetpwd)">
                    <a :href="footer.forgetpwd.href" target="_blank">{{ footer.forgetpwd.title }}</a>
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
import { KEY } from "../../utils/envkey.js";
export default {
    name: "FooterIndex",
    data() {
        return {
            footer: {
                company: "",
                beian: {},
                privacy: {},
                forgetpwd: {},
            },
        };
    },
    computed: {
        copyright() {
            const currentYear = new Date().getFullYear();
            return `© ${currentYear} ${this.footer.company} 版权所有`;
        },
    },
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
    },
    created() {
        this.footer = JSON.parse(window.localStorage.getItem(KEY.AUTHUI_WEB_BASIC_INFO));
        this.footer.forgetpwd = {
            href: "/authui/forgetpwd.html",
            title: "忘记密码",
        };
    },
};
</script>

<style>
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
    .footer-content {
        padding: 10px 0px;
    }
    .footer-list {
        flex-direction: column;
        align-items: center;
        gap: 3px;
    }
}
</style>

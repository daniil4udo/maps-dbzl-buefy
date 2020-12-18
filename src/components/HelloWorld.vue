<template>
    <div class="hello" />
</template>

<script lang="ts">
    import Vue from 'vue';

    export default Vue.extend({
        name: '',
        props: {
            msg: String,
        },
    });
</script>

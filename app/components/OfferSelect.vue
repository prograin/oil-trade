<template>
    <select>
        <template v-for="opt in options">
            <optgroup v-if="opt.group" :label="opt.group">
                <option v-for="v in opt.values" :key="v">{{ v }}</option>
            </optgroup>
            <option v-else>{{ opt }}</option>
        </template>
    </select>
</template>

<script setup>
    defineProps({
        options:Array
    })
</script>
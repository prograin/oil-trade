<template>
    <tr>
        <td >{{ label }}</td>
        <td >
            <slot></slot>
        </td>
    </tr>

</template>

<script setup>
    defineProps({
        label:String
    })
</script>
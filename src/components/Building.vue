<template>
    <b-field label="Building Name">
        <b-autocomplete
            v-model="name"
            placeholder="ONE Jlt"
            :keep-first="keepFirst"
            open-on-focus
            :data="filteredDataObj"
            field="name_en"
            clearable
            @select="option => (selected = option)"
        />
    </b-field>
</template>

<script lang="ts">
    import { defineComponent, PropType } from '@vue/composition-api';

    export default defineComponent({
        name: 'Building',
        props: {
            emirate: {
                type: (String as unknown) as PropType<string>,
                default: () => 'dubai',
            },
            areas: {
                type: (Array as unknown) as PropType<any[]>,
                default: () => null,
            },
            neighborhoods: {
                type: (Object as unknown) as PropType<object>,
                default: () => null,
            },
            buildings: {
                type: (Object as unknown) as PropType<object>,
                default: () => null,
            },
        },
        data() {
            return {
                keepFirst: false,
                openOnFocus: false,
                name: '',
                selected: null,
                clearable: false,
            };
        },
        computed: {
            filteredDataObj() {
                return Object.values(this.buildings).filter(option => (
                    option.name_en
                        .toString()
                        .toLowerCase()
                        .indexOf(this.name.toLowerCase()) >= 0
                ));
            },
        },
    });
</script>

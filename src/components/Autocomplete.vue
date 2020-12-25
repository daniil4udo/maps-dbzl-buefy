<template>
    <B-Field
        expanded
        :label="label"
        :disabled="disabled"
    >
        <B-Autocomplete
            v-model="inputModel"
            clearable
            expanded
            open-on-focus
            :placeholder="placeholder"
            :disabled="disabled"
            :data="filteredData"
            :field="field"
            @select="onAutocompleteSelect"
        >
            <template slot-scope="props">
                <div class="media">
                    <div class="media-content">
                        <strong>{{ props.option[field] }}</strong>
                        <br>
                        <small v-if="props.option.custom_format" v-text="props.option.custom_format" />
                    </div>
                </div>
            </template>
        </B-Autocomplete>
    </B-Field>
</template>

<script lang="ts">
    import Fuse from 'fuse.js';
    import { isNil } from 'lodash';
    import has from 'lodash/has';
    import { Component, Vue, Prop, VModel, Watch } from 'vue-property-decorator';

    import { EmirateKey, IArea, IBuilding } from '@/components/models';

    @Component({
        name: 'Autocomplete',
    })
    export default class Autocomplete<T extends IArea & IBuilding> extends Vue {
        @Prop({ type: String, default: () => '' }) field!: keyof T
        @Prop({ type: String, default: () => '' }) label!: string
        @Prop({ type: String, default: () => '' }) placeholder!: string
        @Prop({ type: Boolean, default: () => false }) disabled!: boolean

        @Prop({ type: String, default: () => null }) emirate!: EmirateKey

        @Prop({ type: Object, default: () => null }) readonly data!: Record<string, T>;
        @Prop({ type: Array, default: () => [ 'name_en', 'name_ar' ] }) readonly indexKeys!: string[];

        inputModel = '';

        @VModel({ type: Object, default: () => null }) selected!: T

        get dataIndex() {
            return new Fuse(Object.values(this.data), {
                includeScore: true,
                keys: this.indexKeys,
                threshold: 0.23,
                includeMatches: true,
            });
        }

        get filteredData() {
            return this.findMatch(this.inputModel);
        }

        @Watch('selected', { immediate: false, deep: true })
        onAutocompleteSelect(newV: T) {
            // We need it because this method is in the @select event
            this.selected = newV;

            if (!isNil(this.selected) && this.inputModel !== this.selected.name_en) {
                this.inputModel = this.selected.name_en;
            }

            this.$emit('autocomplete-changed', newV);
        }

        findMatch(str: string) {
            try {
                if (typeof str === 'string') {
                    return this.dataIndex
                        .search(str)
                        .map(e => e.item);
                }

                console.error(`[Autocomplete]: Search string has to be type 'string'. Got ${typeof str}`);
            }
            catch {
                // If Fuse fails, perform regulat search
                const filteredData = [];

                for (const value in this.data) {
                    if (has(this.data, value)) {
                        if (String(this.data[value]?.name_en).toLowerCase().includes(this.inputModel.toLowerCase())) {
                            // IMPORTANT: assignig it to item prop: mocking Fuse API
                            filteredData.push({ ...this.data[value], value });
                        }
                    }
                }

                return filteredData;
            }
        }
    }
</script>

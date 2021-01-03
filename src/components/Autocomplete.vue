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
            :placeholder="dynamicPlaceholder"
            :disabled="disabled"
            :data="filteredData"
            :field="field"
            @focus="dynamicPlaceholder = 'No time to explain, start typing...'"
            @blur="dynamicPlaceholder = placeholder"
            @select="onAutocompleteChnaged"
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
    import Fuse, { FuseOptionKey } from 'fuse.js/dist/fuse.basic.esm';
    import { Component, Vue, Prop, VModel, Watch } from 'vue-property-decorator';

    import { EmirateKey, IArea, IBuilding } from '@/components/models';
    import { isDefined, has } from '@/utils/';

    @Component({
        name: 'Autocomplete',
    })
    export default class Autocomplete<T extends IArea & IBuilding> extends Vue {
        // Key of data object to dispaly in the autocomplete
        @Prop({ type: String, default: () => '' }) field!: string // keyof T
        // Field text labale
        @Prop({ type: String, default: () => '' }) label!: string
        @Prop({ type: String, default: () => '' }) placeholder!: string
        @Prop({ type: Boolean, default: () => false }) disabled!: boolean

        @Prop({ type: String, default: () => null }) emirate!: EmirateKey

        // TODO: makes sense to pass an array, due to no object use in here
        @Prop({ type: Object, default: () => null }) readonly data!: Record<string, T>;
        @Prop({ type: Array, default: () => [ 'name_en', 'name_ar' ] }) readonly indexKeys!: (keyof T)[];

        inputModel = '';
        dynamicPlaceholder = this.placeholder

        @VModel({ type: Object, default: () => null }) selected!: T

        get dataIndex() {
            return new Fuse(Object.values(this.data), {
                includeScore: true,
                keys: this.indexKeys as FuseOptionKey,
                threshold: 0.23,
                includeMatches: true,
            });
        }

        get filteredData() {
            // if (this.inputModel.length < 1) {
            //     return Object.values(this.data);
            // }
            return this.findMatch(this.inputModel);
        }

        /**
         * Separation of concerns
         * We need it because this method is in the @select event
         */
        onAutocompleteChnaged(s: T) {
            this.selected = s;
        }

        // Track V-Model changes
        @Watch('selected', { immediate: false, deep: true })
        onSelectedChanged(newV: T) {
            if (isDefined(this.selected) && this.inputModel !== this.selected[this.field]) {
                this.inputModel = this.selected[this.field];
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
                        if (String(this.data[value]?.name_en).toLowerCase().includes(str.toLowerCase())) {
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

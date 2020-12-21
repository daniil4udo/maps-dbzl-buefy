<template>
    <b-field
        expanded
        :label="label"
    >
        <b-autocomplete
            v-model="inputModel"
            :placeholder="placeholder"
            open-on-focus
            :data="filteredDataObj"
            :field="field"
            clearable
            expanded
            @select="option => (selected = option)"
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
        </b-autocomplete>
    </b-field>
</template>

<script lang="ts">
    import Fuse from 'fuse.js';
    import has from 'lodash/has';
    import { Component, Vue, Prop, VModel } from 'vue-property-decorator';

    import { EmirateKey, IArea, IBuilding } from '@/components/models';

    @Component({
        name: 'GoogleMapAutocomplete',
    })
    export default class GoogleMapAutocomplete<T extends IArea | IBuilding> extends Vue {
        @Prop({ type: String, default: () => '' }) field!: keyof T
        @Prop({ type: String, default: () => '' }) label!: string
        @Prop({ type: String, default: () => '' }) placeholder!: string

        @Prop({ type: String, default: () => null }) emirate!: EmirateKey

        @Prop({ type: Object, default: () => null }) readonly data!: Record<string, T>;
        @Prop({ type: Array, default: () => [ 'name_en', 'name_ar' ] }) readonly indexKeys!: string[];

        inputModel = '';

        @VModel({ type: Object, default: () => null }) selected!: Record<string, T>

        get dataIndex() {
            return new Fuse(Object.values(this.data), {
                includeScore: true,
                keys: this.indexKeys,
                threshold: 0.23,
                includeMatches: true,
            });
        }

        get filteredDataObj() {
            return this.findMatch(this.inputModel).map(e => e.item);
        }

        findMatch(str: string) {
            try {
                if (typeof str === 'string') {
                    return this.dataIndex.search(str);
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
                            filteredData.push({ item: { ...this.data[value], value } });
                        }
                    }
                }

                return filteredData;
            }
        }
    }
</script>

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

        inputModel = '';

        @VModel({ type: Object, default: () => null }) selected!: Record<string, T>

        get filteredDataObj() {
            const filteredData = [];

            for (const value in this.data) {
                if (String(this.data[value].name_en).toLowerCase().includes(this.inputModel.toLowerCase())) {
                    filteredData.push({ ...this.data[value], value });
                }
            }

            return filteredData;
        }
    }
</script>

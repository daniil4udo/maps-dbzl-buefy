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
            :loading="isFetching"
            :placeholder="placeholder"
            :disabled="disabled || !isIndexMounted"
            :data="filteredData"
            :field="field"
            @typing="handleDebounceAutocompleteTyping"
            @focus="$emit('focus', $event)"
            @blur="$emit('blur', $event)"
            @select="handleAutocompleteChange"
        >
            <template slot-scope="props">
                <div v-if="isFetching" class="media" />
                <div class="media">
                    <div class="media-content">
                        <strong>{{ props.option[field] }}</strong>
                        <br>
                        <small v-if="props.option.custom_format" v-text="props.option.custom_format" />
                    </div>
                </div>
            </template>
            <template slot="empty">
                <template v-if="inputModel && !isFetching">
                    <p>It's time to change your search query.</p>
                </template>
                <template v-else>
                    <p>No time to explain, just start typing...</p>
                </template>
            </template>
        </B-Autocomplete>
    </B-Field>
</template>

<script lang="ts">
    // /* eslint-disable no-unused-vars */
    // /* eslint-disable @typescript-eslint/no-unused-vars */

    import { Component, Vue, Prop, PropSync, Watch, Emit } from 'vue-property-decorator';

    import { EmirateKey, IArea, IBuilding } from '@/components/models';
    import { isDefined, debounce } from '@/utils/';

    import { WorkerSearch } from './search.worker';

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
        @Prop({ type: Array, default: () => [ 'name_en', 'name_ar', 'custom_format' ] }) readonly indexKeys!: string[]; // TODO: keyof T

        isIndexMounted = false;
        isFetching = false;
        inputModel = '';
        dataIndex = null as WorkerSearch<T>;
        filteredData = []

        // @VModel({ type: Object, default: () => null }) selected!: T
        @PropSync('value', { type: Object, default: () => null }) selected!: T

         created() {
            this.initDataIndex().then(i => {
                this.dataIndex = i;
                this.isIndexMounted = true;
            });
        }

        async initDataIndex() {
            try {
                return await new WorkerSearch(this.data, { keys: this.indexKeys });
            }
            catch (e) {
                console.error(`Could mount data index`, e);
            }
            finally {
                await this.$nextTick();
            }
        }

        handleDebounceAutocompleteTyping = debounce(this.handleAutocompleteTyping.bind(this), 150)

        async handleAutocompleteTyping(str: string) {
            try {
                this.isFetching = true;
                this.filteredData = await this.dataIndex.find(str);
            }
            catch (e) {
                console.error(`Couldn't perform search.`, e);
            }
            finally {
                this.isFetching = false;
                await this.$nextTick();
            }
        }

        /**
         * Separation of concerns
         * We need it because this method is in the @select event
         */
        @Emit('changed')
        handleAutocompleteChange(s: T) {
            this.selected = s;
        }

        // Track V-Model changes
        @Watch('selected', { immediate: false, deep: true })
        onSelectedChanged(newV: T) {
            if (isDefined(this.selected) && this.inputModel !== this.selected[this.field]) {
                this.inputModel = this.selected[this.field];
            }
        }
    }
</script>

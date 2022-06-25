<template>
  <b-modal
    v-model="modal"
    size="xl"
    hide-footer
    @hide="$emit('close')"
  >
    <b-overlay
      :show="isLoading"
      rounded="sm"
    >
      <b-card>
        <validation-observer v-slot="{ invalid }">
          <b-container fluid>
            <b-row>
              <b-col cols="12">
                <h1
                  style="font-family:'Bebas Neue', cursive;"
                  no-body
                  class="text-center"
                >
                  Add an in-kind donation
                </h1>
              </b-col>
            </b-row>

            <b-alert
              :show="!!errorMessage"
              variant="danger"
            >
              {{ errorMessage }}
            </b-alert>

            <b-row class="pt-1">
              <b-col
                cols="12"
                md="6"
              >
                <label for="item-sku">
                  Stock Keeping Unit (SKU) <b-icon
                    v-b-tooltip="'Unique identifier of the item'"
                    icon="info-circle"
                    font-scale=".85"
                  />
                </label>

                <validation-provider
                  v-slot="validationContext"
                  :rules="{
                    required: true,
                    max: 100
                  }"
                >
                  <b-form-input
                    v-model="form.sku"
                    name="item-sku"
                    :state="getValidationState(validationContext)"
                    aria-describedby="item-sku-feedback"
                    :formatter="toUpperCase"
                  />

                  <b-form-invalid-feedback id="item-sku-feedback">
                    {{ validationContext.errors[0] }}
                  </b-form-invalid-feedback>
                </validation-provider>
              </b-col>

              <b-col
                cols="12"
                md="6"
              >
                <label for="item-name">Item Name</label>

                <validation-provider
                  v-slot="validationContext"
                  :rules="{
                    required: true,
                    max: 100
                  }"
                >
                  <b-form-input
                    v-model="form.name"
                    name="item-name"
                    :state="getValidationState(validationContext)"
                    aria-describedby="item-name-feedback"
                  />

                  <b-form-invalid-feedback id="item-name-feedback">
                    {{ validationContext.errors[0] }}
                  </b-form-invalid-feedback>
                </validation-provider>
              </b-col>
            </b-row>

            <b-row class="pt-3">
              <b-col cols="12">
                <label for="item-group">
                  Group
                </label>

                <b-dropdown
                  :text="form.group || 'Select a group'"
                  style="width: 100%"
                  menu-class="w-100"
                  variant="outline-primary"
                  :no-caret="!!form.group"
                  no-flip
                >
                  <b-dropdown-form>
                    <b-form-group
                      label="Search Group"
                      label-for="item-group"
                      @submit.stop.prevent
                    >
                      <b-form-input
                        id="item-group"
                        v-model="itemGroupSearch"
                        debounce="250"
                        @update="searchInkindDonationGroups"
                      />
                    </b-form-group>
                  </b-dropdown-form>
                  <b-dropdown-divider />
                  <b-dropdown-item
                    v-for="group in groupOptions"
                    :key="group._id"
                    @click="selectGroup(group)"
                  >
                    {{ group.name }}
                  </b-dropdown-item>

                  <b-dropdown-item
                    v-if="itemGroupSearch !== '' && groupOptions.length === 0"
                    @click="selectGroup({ name: itemGroupSearch })"
                  >
                    Add `{{ itemGroupSearch }}` group
                  </b-dropdown-item>

                  <b-dropdown-item
                    v-if="form.group !== ''"
                    style="background-color: #f2f2f2"
                    @click="unselectGroup()"
                  >
                    Unset `{{ form.group }}` group
                  </b-dropdown-item>
                </b-dropdown>
              </b-col>
            </b-row>

            <b-row class="pt-1">
              <b-col cols="12">
                <b-form-group class="text-start">
                  <label for="item-description">
                    Item Description
                  </label>

                  <validation-provider
                    v-slot="validationContext"
                    :rules="{
                      max: 200
                    }"
                  >
                    <b-form-textarea
                      id="item-description"
                      v-model="form.description"
                      rows="3"
                      max-rows="8"
                      :state="getValidationState(validationContext)"
                      aria-describedby="item-description-feedback"
                    />

                    <b-form-invalid-feedback id="item-description-feedback">
                      {{ validationContext.errors[0] }}
                    </b-form-invalid-feedback>
                  </validation-provider>
                </b-form-group>
              </b-col>
            </b-row>

            <b-row class="pt-3">
              <b-col
                cols="12"
                md="6"
              >
                <label for="item-quantity">Initial Quantity</label>

                <b-form-input
                  v-model="form.quantity"
                  type="number"
                  name="item-quantity"
                  :formatter="toZeroOrPositive"
                />
              </b-col>

              <b-col
                cols="12"
                md="6"
              >
                <label for="item-uom">Unit of Measurement</label>
                <b-form-select
                  v-model="form.unit"
                  style="width: 100%; padding: 0.5rem 0.75rem"
                  name="item-uom"
                  :options="unitOptions"
                  size="lg"
                  :disabled="preselectGroupUnit"
                />
              </b-col>
            </b-row>

            <b-row class="pt-3">
              <b-col cols="12">
                <label for="item-category">Category</label>
                <b-dropdown
                  :text="form.category ? form.category.name : 'Select a category'"
                  style="width: 100%"
                  menu-class="w-100"
                  variant="outline-primary"
                  :no-caret="!!form.category"
                  no-flip
                >
                  <b-dropdown-form>
                    <b-form-group
                      label="Search Category"
                      label-for="item-category"
                      @submit.stop.prevent
                    >
                      <b-form-input
                        id="item-category"
                        debounce="500"
                        @update="searchInkindDonationCategories"
                      />
                    </b-form-group>
                  </b-dropdown-form>
                  <b-dropdown-divider />
                  <b-dropdown-item
                    v-for="category in categoryOptions"
                    :key="category._id"
                    @click="selectCategory(category)"
                  >
                    {{ category.name }}
                  </b-dropdown-item>
                </b-dropdown>
              </b-col>
            </b-row>

            <b-row
              v-if="form.categoryCustomFields.length > 0"
              class="pt-3"
            >
              <b-col
                v-for="customField in form.categoryCustomFields"
                :key="customField.key"
              >
                <template v-if="customField.dataType === 'DATE'">
                  <label :for="customField.key">{{ customField.label }}</label>
                  <b-form-datepicker
                    v-model="customField.value"
                    :label="customField.key"
                    value-as-date
                    :min="today"
                  />
                </template>
              </b-col>
            </b-row>

            <b-row class="pt-3">
              <b-col cols="12">
                <label for="item-donor">
                  Donor
                </label>

                <b-dropdown
                  :text="form.donor || 'Select a donor'"
                  style="width: 100%"
                  menu-class="w-100"
                  variant="outline-primary"
                  :no-caret="!!form.donor"
                  no-flip
                >
                  <b-dropdown-form>
                    <b-form-group
                      label="Search Donor"
                      label-for="item-donor"
                      @submit.stop.prevent
                    >
                      <b-form-input
                        id="item-donor"
                        v-model="itemDonorSearch"
                        debounce="250"
                        @update="searchInkindDonationDonors"
                      />
                    </b-form-group>
                  </b-dropdown-form>
                  <b-dropdown-divider />
                  <b-dropdown-item
                    v-for="donor in donorOptions"
                    :key="donor._id"
                    @click="selectDonor(donor)"
                  >
                    {{ donor.name }}
                  </b-dropdown-item>

                  <b-dropdown-item
                    v-if="itemDonorSearch !== '' && !isDonorSearchInOptions()"
                    @click="selectDonor({ name: itemDonorSearch })"
                  >
                    Add `{{ itemDonorSearch }}` donor
                  </b-dropdown-item>

                  <b-dropdown-item
                    v-if="form.donor !== ''"
                    style="background-color: #f2f2f2"
                    @click="unselectDonor()"
                  >
                    Unset `{{ form.donor }}` donor
                  </b-dropdown-item>
                </b-dropdown>
              </b-col>
            </b-row>

            <b-row
              v-if="form.donor"
              class="pt-1"
            >
              <b-col cols="12">
                <label for="item-donor">
                  Acknowledgement Email <span style="color: grey">(for Donor)</span>
                </label>

                <b-form-input
                  v-model="form.donorEmail"
                  name="item-donorEmail"
                />
              </b-col>
            </b-row>

            <b-row
              v-if="form.quantity > 0"
              class="pt-3"
            >
              <b-col cols="12">
                <label
                  for="item-file-upload"
                  class="form-label"
                >
                  Item Receipt
                </label>

                <input
                  id="item-file-upload"
                  class="form-control"
                  type="file"
                  @change="handleFileUpload"
                >
              </b-col>
            </b-row>

            <b-row
              class="pt-4 pb-3"
              align-h="center"
            >
              <b-col cols="2">
                <b-button
                  style="font-size: 16px; padding: 8px; width: 150px;"
                  pill
                  variant="danger"
                  :disabled="invalid"
                  @click="confirmModal = !confirmModal"
                >
                  Add Donation
                </b-button>
              </b-col>
            </b-row>
          </b-container>
        </validation-observer>
      </b-card>
    </b-overlay>

    <b-modal
      v-model="confirmModal"
      @ok="createdInkindDonation"
      @cancel="confirmModal = false"
    >
      <b-container fluid>
        <h1 style="font-family:'Bebas Neue', cursive; text-align:center;">
          Are you sure with all the details?
        </h1>
      </b-container>
    </b-modal>
  </b-modal>
</template>

<script>
import { mapGetters } from 'vuex'
import { pickBy, identity } from 'lodash'
import { ValidationObserver, ValidationProvider, extend } from 'vee-validate'
import { required, min, max } from 'vee-validate/dist/rules'

import InkindDonationGroupRepository from '../../repositories/inkind-donations/groups'
import InkindDonationCategoryRepository from '../../repositories/inkind-donations/categories'
import InkindDonationDonorRepository from '../../repositories/inkind-donations/donors'
import InkindDonationRepository from '../../repositories/inkind-donations'
import { apiClient } from '../../axios'
import validationMixin from '../../mixins/validation'
import formattersMixin from '../../mixins/formatters'

const inkindDonationGroupRepository = new InkindDonationGroupRepository(apiClient)
const inkindDonationCategoryRepository = new InkindDonationCategoryRepository(apiClient)
const inkindDonationDonorRepository = new InkindDonationDonorRepository(apiClient)
const inkindDonationRepository = new InkindDonationRepository(apiClient)

extend('required', {
  ...required,
  message: 'This field is required'
})
extend('min', {
  ...min,
  message: 'This field must be greater than or equal to {length} characters'
})
extend('max', {
  ...max,
  message: 'This field must be less than or equal to {length} characters'
})

const today = new Date()

export default {
  name: 'InkindDonationCreateItemModal',
  components: {
    ValidationObserver,
    ValidationProvider
  },
  mixins: [
    validationMixin,
    formattersMixin
  ],
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      today,
      modal: false,
      isLoading: false,
      itemGroupSearch: '',
      itemDonorSearch: '',
      preselectGroupUnit: false,
      confirmModal: false,
      form: {
        sku: '',
        name: '',
        description: '',
        quantity: 0,
        unit: 'boxes',
        donor: '',
        donorEmail: '',
        category: null,
        categoryCustomFields: [],
        group: '',
        file: null
      },
      unitOptions: [
        { value: 'boxes', text: 'Boxes' },
        { value: 'pcs', text: 'Pieces' },
        { value: 'packs', text: 'Packs' },
        { value: 'bottles', text: 'Bottles' },
        { value: 'gallons', text: 'Gallons' },
        { value: 'kg', text: 'Kilograms' },
        { value: 'L', text: 'Liters' }
      ],
      donorOptions: [],
      groupOptions: [],
      categoryOptions: [],
      errorMessage: ''
    }
  },
  computed: {
    ...mapGetters(['token'])
  },
  watch: {
    show (val) {
      this.modal = val
    }
  },
  created () {
    const authHeader = `Bearer ${this.token}`

    inkindDonationGroupRepository.setAuthorizationHeader(authHeader)
    inkindDonationCategoryRepository.setAuthorizationHeader(authHeader)
    inkindDonationDonorRepository.setAuthorizationHeader(authHeader)
    inkindDonationRepository.setAuthorizationHeader(authHeader)

    this.searchInkindDonationGroups()
    this.searchInkindDonationCategories()
    this.searchInkindDonationDonors()
  },
  methods: {
    async searchInkindDonationDonors (value) {
      const { results } = await inkindDonationDonorRepository.list({
        name: value
      }, {
        limit: 5
      })

      this.donorOptions = results
    },
    isDonorSearchInOptions () {
      if (this.donorOptions.length === 0) {
        return false
      }

      const index = this.donorOptions.findIndex((option) => option.name === this.itemDonorSearch)

      return index !== -1
    },
    selectDonor (donor) {
      this.form.donor = donor.name

      if (donor.email !== undefined) {
        this.form.donorEmail = donor.email
      }

      this.itemDonorSearch = ''
    },
    unselectDonor () {
      this.form.donor = ''
      this.form.donorEmail = ''
      this.itemDonorSearch = ''
    },
    async searchInkindDonationGroups (value) {
      const { results } = await inkindDonationGroupRepository.list({
        name: value
      }, {
        limit: 5
      })

      this.groupOptions = results
    },
    selectGroup (group) {
      this.form.group = group.name

      if (group.unit !== undefined) {
        this.form.unit = group.unit
        this.preselectGroupUnit = true
      }

      this.itemGroupSearch = ''
    },
    unselectGroup () {
      this.form.group = ''
      this.itemGroupSearch = ''

      this.preselectGroupUnit = false
    },
    async searchInkindDonationCategories (value) {
      const { results } = await inkindDonationCategoryRepository.list({
        name: value
      }, {
        limit: 5
      })

      this.categoryOptions = results
    },
    selectCategory (category) {
      this.form.category = category

      this.form.categoryCustomFields = []

      if (category.customFields !== undefined) {
        for (const key of Object.keys(category.customFields)) {
          this.form.categoryCustomFields.push({
            label: category.customFields[key].label,
            dataType: category.customFields[key].dataType,
            key,
            value: undefined
          })
        }
      }
    },
    async createdInkindDonation () {
      this.errorMessage = ''
      this.isLoading = true

      const {
        sku,
        name,
        description,
        quantity,
        unit,
        donor,
        donorEmail,
        category,
        categoryCustomFields,
        group,
        file
      } = this.form

      let categoryId

      if (category !== null) {
        categoryId = category._id
      }

      const inkindDonation = pickBy({
        sku,
        name,
        description,
        unit,
        donor,
        donorEmail,
        categoryId,
        categoryCustomFields,
        group
      }, identity)

      inkindDonation.quantity = quantity
      inkindDonation.file = file

      try {
        await inkindDonationRepository.create(inkindDonation)

        this.$router.go()
      } catch (error) {
        this.isLoading = false
        const data = error.response?.data

        if (data) {
          const { status, message } = data

          if (status === 409 && message === 'duplicate_ikd_sku') {
            this.errorMessage = 'SKU Item already exists!'
          }
        }
      }
    },
    handleFileUpload (event) {
      const files = event.target.files

      if (files.length === 0) {
        this.form.file = null

        return
      }

      const [file] = files

      this.form.file = file
    }
  }
}
</script>

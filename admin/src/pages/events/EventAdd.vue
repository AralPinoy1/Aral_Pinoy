<template>
  <div>
    <b-container class="py-5">
      <b-row>
        <b-col cols="12">
          <b-card style="border-radius: 20px;">
            <validation-observer>
              <b-container>
                <h2 style="font-family:'Bebas Neue', cursive; color: black; position: relative; text-align: center;">
                  Create Event
                </h2>

                <b-skeleton-wrapper :loading="isFetchingTemplate">
                  <template #loading>
                    <b-spinner
                      class="my-5"
                      style="width: 10rem; height: 10rem;"
                    />
                  </template>

                  <div>
                    <b-form>
                      <b-row class="pt-4">
                        <b-col cols="12">
                          <b-card style="border-radius: 20px;">
                            <b-row>
                              <b-form-group class="text-start">
                                <label
                                  class="py-1"
                                  for="input-event-name"
                                  style="font-family: 'Bebas Neue', cursive;"
                                >
                                  Event Name:
                                </label>

                                <validation-provider
                                  v-slot="validationContext"
                                  :rules="{
                                    required: true,
                                    max: 100
                                  }"
                                >
                                  <b-form-input
                                    id="input-event-name"
                                    v-model="event.name"
                                    :state="getValidationState(validationContext)"
                                    placeholder="Enter Event Name"
                                    aria-describedby="input-event-name-feedback"
                                  />

                                  <b-form-invalid-feedback id="input-event-name-feedback">
                                    {{ validationContext.errors[0] }}
                                  </b-form-invalid-feedback>
                                </validation-provider>
                              </b-form-group>
                            </b-row>

                            <b-row>
                              <b-form-group class="pt-2  text-start">
                                <label
                                  class="py-1"
                                  for="select-event-type"
                                  style="font-family: 'Bebas Neue', cursive;"
                                >
                                  Event Type:
                                </label>

                                <b-col>
                                  <select
                                    id="select-event-type"
                                    v-model="event.type"
                                    class="form-select"
                                  >
                                    <option
                                      v-for="type in eventTypeOptions"
                                      :key="type.label"
                                      :value="type.label"
                                    >
                                      {{ type.label }}
                                    </option>
                                  </select>
                                </b-col>
                              </b-form-group>
                            </b-row>

                            <b-row>
                              <b-col cols="12">
                                <b-form-group class="pt-2 text-start">
                                  <label
                                    class="py-1 text-start"
                                    for="input-event-location-name"
                                    style="font-family: 'Bebas Neue', cursive;"
                                  >
                                    Location:
                                  </label>

                                  <validation-provider
                                    v-slot="validationContext"
                                    :rules="{
                                      required: true,
                                      max: 500
                                    }"
                                  >
                                    <b-form-input
                                      id="input-event-location-name"
                                      v-model="event.location.name"
                                      :state="getValidationState(validationContext)"
                                      placeholder="Enter Location of the Event"
                                      aria-describedby="input-event-location-name-feedback"
                                    />

                                    <b-form-invalid-feedback id="input-event-location-name-feedback">
                                      {{ validationContext.errors[0] }}
                                    </b-form-invalid-feedback>
                                  </validation-provider>
                                </b-form-group>
                              </b-col>
                            </b-row>

                            <b-row class="pt-3">
                              <b-col cols="12">
                                <b-form-group class="pt-2 text-start">
                                  <div class="form-check form-switch">
                                    <label
                                      class="form-check-label"
                                      for="input-event-save-as-template-checkbox"
                                      style="font-family: 'Bebas Neue', cursive;"
                                    >
                                      Save as Template
                                    </label>

                                    <input
                                      id="input-event-save-as-template-checkbox"
                                      v-model="event.saveAsTemplate"
                                      class="form-check-input"
                                      type="checkbox"
                                    >
                                  </div>
                                </b-form-group>
                              </b-col>
                            </b-row>

                            <template v-if="event.saveAsTemplate">
                              <b-row>
                                <b-form-group class="text-start">
                                  <label
                                    class="py-1"
                                    for="input-event-template-name"
                                    style="font-family: 'Bebas Neue', cursive;"
                                  >
                                    Template Name:
                                  </label>

                                  <validation-provider
                                    v-slot="validationContext"
                                    :rules="{
                                      required: event.saveAsTemplate,
                                      max: 100
                                    }"
                                  >
                                    <b-form-input
                                      id="input-event-template-name"
                                      v-model="event.templateName"
                                      :state="getValidationState(validationContext)"
                                      placeholder="Enter Template Name"
                                      aria-describedby="input-event-template-name-feedback"
                                    />

                                    <b-form-invalid-feedback id="input-event-template-name-feedback">
                                      {{ validationContext.errors[0] }}
                                    </b-form-invalid-feedback>
                                  </validation-provider>
                                </b-form-group>
                              </b-row>

                              <b-row>
                                <b-col cols="12">
                                  <b-form-group class="text-start">
                                    <label
                                      class="py-1"
                                      for="textarea-event-template-description"
                                      style="font-family:'Bebas Neue', cursive;"
                                    >
                                      Template Description:
                                    </label>

                                    <validation-provider
                                      v-slot="validationContext"
                                      :rules="{
                                        max: 5000
                                      }"
                                    >
                                      <b-form-textarea
                                        id="textarea-event-description"
                                        v-model="event.templateDescription"
                                        rows="3"
                                        max-rows="8"
                                        :state="getValidationState(validationContext)"
                                        aria-describedby="textarea-event-template-description-feedback"
                                        placeholder="Enter Template Description"
                                      />

                                      <b-form-invalid-feedback id="textarea-event-template-description-feedback">
                                        {{ validationContext.errors[0] }}
                                      </b-form-invalid-feedback>
                                    </validation-provider>
                                  </b-form-group>
                                </b-col>
                              </b-row>
                            </template>

                            <b-row class="pt-3">
                              <b-col cols="12">
                                <b-form-group class="pt-2 text-start">
                                  <div class="form-check form-switch">
                                    <label
                                      class="form-check-label"
                                      for="is-urgent-event-checkbox"
                                      style="font-family: 'Bebas Neue', cursive;"
                                    >
                                      Urgent
                                    </label>

                                    <input
                                      id="is-urgent-event-checkbox"
                                      v-model="isUrgentEvent"
                                      class="form-check-input"
                                      type="checkbox"
                                    >
                                  </div>
                                </b-form-group>
                              </b-col>
                            </b-row>

                            <b-row>
                              <b-col>
                                <b-form-group
                                  label="Start Date:"
                                  style="font-family:'Bebas Neue', cursive; text-align:left; margin-top:10px; margin-bottom:10px;"
                                >
                                  <b-form-datepicker
                                    v-model="startDate.date"
                                    class="mb-2"
                                    :min="minStartDate"
                                    required
                                  />
                                </b-form-group>
                              </b-col>

                              <b-col>
                                <b-form-group
                                  label="Start Time:"
                                  style="font-family:'Bebas Neue', cursive; text-align:left; margin-top:10px; margin-bottom:10px;"
                                >
                                  <b-form-timepicker
                                    v-model="startDate.time"
                                    locale="en"
                                    minutes-step="10"
                                    required
                                  />
                                </b-form-group>
                              </b-col>
                            </b-row>

                            <b-row>
                              <b-col>
                                <b-form-group
                                  label="End Date:"
                                  style="font-family:'Bebas Neue', cursive; text-align:left; margin-top:10px; margin-bottom:10px;"
                                >
                                  <b-form-datepicker
                                    v-model="endDate.date"
                                    class="mb-2"
                                    required
                                    :min="startDate.date"
                                  />
                                </b-form-group>
                              </b-col>

                              <b-col>
                                <b-form-group
                                  label="End Time:"
                                  style="font-family:'Bebas Neue', cursive; text-align:left; margin-top:10px; margin-bottom:10px;"
                                >
                                  <b-form-timepicker
                                    v-model="endDate.time"
                                    locale="en"
                                    minutes-step="10"
                                    required
                                  />
                                </b-form-group>
                              </b-col>
                            </b-row>

                            <b-row>
                              <b-col cols="12">
                                <b-form-tags>
                                  <template>
                                    <ul
                                      v-if="event.contacts.length > 0"
                                      class="list-inline d-inline-block mb-2"
                                    >
                                      <li
                                        v-for="(contact, index) in event.contacts"
                                        :key="index"
                                        class="list-inline-item"
                                      >
                                        <b-form-tag
                                          class="bg-success"
                                          @remove="removeEventContact(index)"
                                        >
                                          {{ contact.name }} - {{ contact.contactMethods[0].value }}
                                        </b-form-tag>
                                      </li>
                                    </ul>

                                    <b-dropdown
                                      ref="eventContactFormDropdown"
                                      text="Add Contacts"
                                      style="width: 100%"
                                      menu-class="w-100"
                                      variant="primary"
                                    >
                                      <b-dropdown-form>
                                        <b-form-group
                                          label="Name"
                                          label-for="event-contact-name"
                                          @submit.stop.prevent
                                        >
                                          <b-form-input
                                            id="event-contact-name"
                                            v-model="contactForm.name"
                                          />
                                        </b-form-group>

                                        <b-form-group
                                          class="pt-3"
                                          label="Contact Method"
                                          label-for="event-contact-method-type"
                                          @submit.stop.prevent
                                        >
                                          <b-input-group>
                                            <b-form-select
                                              id="event-contact-method-type"
                                              v-model="contactForm.contactMethods[0].type"
                                              style="width: 100%; padding: 0.5rem 0.75rem"
                                              :options="['EMAIL', 'MOBILE']"
                                              size="lg"
                                            />
                                          </b-input-group>
                                        </b-form-group>

                                        <b-form-group
                                          class="pt-3"
                                          label="Contact Details"
                                          label-for="event-contact-method-value"
                                          @submit.stop.prevent
                                        >
                                          <b-input-group>
                                            <b-form-input
                                              id="event-method-value"
                                              v-model="contactForm.contactMethods[0].value"
                                              class="ml-3"
                                            />
                                          </b-input-group>
                                        </b-form-group>

                                        <b-button
                                          class="mt-4"
                                          variant="success"
                                          @click="addEventContact"
                                        >
                                          Submit
                                        </b-button>
                                      </b-dropdown-form>
                                    </b-dropdown>
                                  </template>
                                </b-form-tags>
                              </b-col>
                            </b-row>
                          </b-card>
                        </b-col>
                      </b-row>

                      <b-row class="pt-4">
                        <b-col cols="12">
                          <b-card style="border-radius: 20px;">
                            <h3 style="font-family:'Bebas Neue', cursive; color: black; position: relative; text-align: left; font-size:20px;">
                              Event Logo
                            </h3>

                            <b-img
                              v-if="!!displayLogo"
                              :src="displayLogo"
                              fluid
                              alt="event logo"
                            />
                            <br>
                            <b-form-file
                              v-model="event.logo"
                              class="mt-3"
                              plain
                            />
                          </b-card>
                        </b-col>
                      </b-row>

                      <b-row class="pt-4">
                        <b-col cols="12">
                          <b-card style="border-radius: 20px;">
                            <b-form-group class="text-start">
                              <label
                                class="py-1"
                                for="textarea-event-description"
                                style="font-family:'Bebas Neue', cursive;"
                              >
                                Event Description:
                              </label>

                              <validation-provider
                                v-slot="validationContext"
                                :rules="{
                                  max: 5000
                                }"
                              >
                                <b-form-textarea
                                  id="textarea-event-description"
                                  v-model="event.description"
                                  rows="3"
                                  max-rows="8"
                                  :state="getValidationState(validationContext)"
                                  aria-describedby="textarea-event-description-feedback"
                                  placeholder="Enter event description and other important details"
                                />

                                <b-form-invalid-feedback id="textarea-event-description-feedback">
                                  {{ validationContext.errors[0] }}
                                </b-form-invalid-feedback>
                              </validation-provider>
                            </b-form-group>
                          </b-card>
                        </b-col>
                      </b-row>

                      <b-row class="pt-4">
                        <b-col cols="12">
                          <b-card style="border-radius: 20px;">
                            <b-row>
                              <b-col cols="12">
                                <b-form-group
                                  label="Donation needed (in PHP):"
                                  style="font-family:'Bebas Neue', cursive; text-align:left; margin-top:10px; margin-bottom:10px;"
                                >
                                  <b-form-input
                                    v-model="event.goals.monetaryDonation"
                                    placeholder="Enter the required amount for the Event"
                                    :formatter="toCurrency"
                                    lazy-formatter
                                    required
                                    @focus="event.goals.monetaryDonation = fromCurrencyToNumber(event.goals.monetaryDonation)"
                                  />
                                </b-form-group>
                              </b-col>
                            </b-row>
                          </b-card>
                        </b-col>
                      </b-row>

                      <b-row class="pt-4">
                        <b-col cols="12">
                          <b-card>
                            <b-col cols="12">
                              <h5
                                class="text-start"
                                style="font-family:'Bebas Neue', cursive;"
                              >
                                Budget Proposal Breakdown
                              </h5>
                            </b-col>

                            <b-col cols="12">
                              <b-table
                                :items="event.budget.breakdown"
                                :fields="[
                                  { key: 'amount', label: 'Amount' },
                                  { key: 'type', label: 'Type of expense' },
                                  { key: 'action', label: 'Action' }
                                ]"
                                show-empty
                                striped
                                primary-key="item.type"
                              >
                                <template #cell(amount)="{ value: amount }">
                                  {{
                                    new Intl.NumberFormat('en-us', {
                                      style: 'currency',
                                      currency: 'PHP'
                                    }).format(amount)
                                  }}
                                </template>

                                <template #cell(action)="{ index }">
                                  <b-button
                                    variant="danger"
                                    @click="removeFromBudget(index)"
                                  >
                                    <b-icon icon="trash" />
                                  </b-button>
                                </template>
                              </b-table>
                            </b-col>

                            <b-col cols="12">
                              <b-button
                                class="w-100 mb-3"
                                :disabled="budgetForm.show"
                                @click="budgetForm.show = true"
                              >
                                Add to Breakdown
                              </b-button>

                              <b-collapse v-model="budgetForm.show">
                                <b-card>
                                  <validation-observer
                                    ref="budgetObs"
                                    v-slot="{ invalid: invalidBudget }"
                                  >
                                    <b-container>
                                      <b-row>
                                        <b-col cols="12">
                                          <b-form-group class="text-start">
                                            <label
                                              class="py-1"
                                              for="input-budget-breakdown-type"
                                              style="font-family: 'Bebas Neue', cursive;"
                                            >
                                              Type
                                            </label>

                                            <validation-provider
                                              v-slot="validationContext"
                                              :rules="{
                                                required: true
                                              }"
                                            >
                                              <b-form-input
                                                id="input-budget-breakdown-type"
                                                v-model="budgetForm.details.type"
                                                placeholder="Ex: Materials"
                                                :state="getValidationState(validationContext)"
                                                aria-describedby="input-budget-breakdown-type-feedback"
                                              />

                                              <b-form-invalid-feedback id="input-budget-breakdown-type-feedback">
                                                {{ validationContext.errors[0] }}
                                              </b-form-invalid-feedback>
                                            </validation-provider>
                                          </b-form-group>
                                        </b-col>

                                        <b-col cols="12">
                                          <b-form-group class="text-start">
                                            <label
                                              class="py-1"
                                              for="input-budget-breakdown-amount"
                                              style="font-family: 'Bebas Neue', cursive;"
                                            >
                                              Amount
                                            </label>

                                            <validation-provider
                                              v-slot="validationContext"
                                              :rules="{
                                                required: true
                                              }"
                                            >
                                              <b-form-input
                                                id="input-budget-breakdown-amount"
                                                v-model="budgetForm.details.amount"
                                                lazy-formatter
                                                :formatter="toCurrency"
                                                :state="getValidationState(validationContext)"
                                                aria-describedby="input-budget-breakdown-amount-feedback"
                                                @focus="budgetForm.details.amount = fromCurrencyToNumber(budgetForm.details.amount)"
                                              />

                                              <b-form-invalid-feedback id="input-budget-breakdown-amount-feedback">
                                                {{ validationContext.errors[0] }}
                                              </b-form-invalid-feedback>
                                            </validation-provider>
                                          </b-form-group>
                                        </b-col>

                                        <b-col
                                          class="pt-3"
                                          cols="12"
                                        >
                                          <b-row>
                                            <b-col
                                              cols="12"
                                              md="6"
                                            >
                                              <b-button
                                                class="w-100"
                                                @click="budgetForm.show = false"
                                              >
                                                Cancel
                                              </b-button>
                                            </b-col>

                                            <b-col
                                              cols="12"
                                              md="6"
                                            >
                                              <b-button
                                                class="w-100"
                                                variant="success"
                                                :disabled="invalidBudget"
                                                @click="addToBudgetBreakdown"
                                              >
                                                Submit
                                              </b-button>
                                            </b-col>
                                          </b-row>
                                        </b-col>
                                      </b-row>
                                    </b-container>
                                  </validation-observer>
                                </b-card>
                              </b-collapse>
                            </b-col>
                          </b-card>
                        </b-col>
                      </b-row>

                      <b-row class="pt-4">
                        <b-col cols="12">
                          <b-card style="border-radius: 20px;">
                            <h5
                              class="text-start"
                              style="font-family:'Bebas Neue', cursive;"
                            >
                              Sustainable Development Goals
                            </h5>
                            <b-row class="text-center">
                              <b-col
                                v-for="sdg in sdgOptions"
                                :key="sdg._id"
                                cols="4"
                              >
                                <b-form-checkbox
                                  v-model="event.sdgIds"
                                  :value="sdg._id"
                                >
                                  &nbsp;
                                  <b-avatar
                                    :src="sdg.imageUrl"
                                    size="150px"
                                    square
                                  />
                                </b-form-checkbox>
                              </b-col>
                            </b-row>
                          </b-card>
                        </b-col>
                      </b-row>

                      <b-row class="pt-4">
                        <b-col cols="12">
                          <b-card style="border-radius: 20px;">
                            <h5
                              class="text-start"
                              style="font-family:'Bebas Neue', cursive;"
                            >
                              Roles
                            </h5>

                            <b-row class="pt-2">
                              <b-col cols="12">
                                <b-table
                                  :items="event.jobs"
                                  :fields="jobFields"
                                  show-empty
                                  responsive
                                  striped
                                  primary-key="index"
                                >
                                  <template #cell(skills)="{ item }">
                                    <template v-if="item.skills.length > 0">
                                      <b-form-tag
                                        v-for="jobSkill in item.skills"
                                        :key="jobSkill._id"
                                        class="bg-success"
                                        disabled
                                      >
                                        {{ jobSkill.name }}
                                      </b-form-tag>
                                    </template>
                                  </template>

                                  <template #cell(actions)="{ index }">
                                    <b-button
                                      variant="danger"
                                      @click="removeEventJob(index)"
                                    >
                                      <b-icon icon="trash" />
                                    </b-button>
                                  </template>
                                </b-table>
                              </b-col>

                              <b-col cols="12">
                                <b-button
                                  class="w-100 mb-3"
                                  :disabled="showJobForm"
                                  @click="showJobForm = true"
                                >
                                  Add Role
                                </b-button>

                                <b-collapse v-model="showJobForm">
                                  <b-card>
                                    <validation-observer
                                      ref="jobObs"
                                      v-slot="{ invalid: invalidRole }"
                                    >
                                      <b-container>
                                        <b-row>
                                          <b-col cols="12">
                                            <b-form-group class="text-start">
                                              <label
                                                class="py-1"
                                                for="input-job-name"
                                                style="font-family: 'Bebas Neue', cursive;"
                                              >
                                                Role Name:
                                              </label>

                                              <validation-provider
                                                v-slot="validationContext"
                                                :rules="{
                                                  required: showJobForm === true,
                                                  max: 50
                                                }"
                                              >
                                                <b-form-input
                                                  id="input-job-name"
                                                  v-model="jobForm.name"
                                                  placeholder="Ex: Trash Collector"
                                                  :state="getValidationState(validationContext)"
                                                  aria-describedby="input-job-name-feedback"
                                                />

                                                <b-form-invalid-feedback id="input-job-name-feedback">
                                                  {{ validationContext.errors[0] }}
                                                </b-form-invalid-feedback>
                                              </validation-provider>
                                            </b-form-group>
                                          </b-col>

                                          <b-col
                                            class="pt-2"
                                            cols="12"
                                          >
                                            <b-form-group class="text-start">
                                              <label
                                                class="py-1"
                                                for="textarea-job-description"
                                                style="font-family: 'Bebas Neue', cursive;"
                                              >
                                                Role Description:
                                              </label>

                                              <validation-provider
                                                v-slot="validationContext"
                                                :rules="{
                                                  max: 100
                                                }"
                                              >
                                                <b-form-textarea
                                                  id="textarea-job-description"
                                                  v-model="jobForm.description"
                                                  rows="3"
                                                  max-rows="8"
                                                  placeholder="Ex: Picks up and remove waste from locations and takes the waste to a designated location for proper disposal"
                                                  :state="getValidationState(validationContext)"
                                                  aria-describedby="textarea-job-description-feedback"
                                                />

                                                <b-form-invalid-feedback id="textarea-job-description-feedback">
                                                  {{ validationContext.errors[0] }}
                                                </b-form-invalid-feedback>
                                              </validation-provider>
                                            </b-form-group>
                                          </b-col>

                                          <b-col
                                            class="pt-2"
                                            cols="12"
                                          >
                                            <b-form-group
                                              label="Number of Volunteers Needed"
                                              style="font-family:'Bebas Neue', cursive; text-align:left; margin-top:10px; margin-bottom:10px;"
                                            >
                                              <b-form-input
                                                v-model="jobForm.requirements.max"
                                                type="number"
                                                step="1"
                                                lazy-formatter
                                                :formatter="validatePositive"
                                                required
                                              />
                                            </b-form-group>
                                          </b-col>

                                          <b-col
                                            class="pt-2"
                                            cols="12"
                                          >
                                            <b-form-tags>
                                              <template>
                                                <ul
                                                  v-if="jobForm.skills.length > 0"
                                                  class="list-inline d-inline-block mb-2"
                                                >
                                                  <li
                                                    v-for="(jobSkill, index) in jobForm.skills"
                                                    :key="index"
                                                    class="list-inline-item"
                                                  >
                                                    <b-form-tag
                                                      class="bg-success"
                                                      @remove="removeJobSkill(index)"
                                                    >
                                                      {{ jobSkill.name }}
                                                    </b-form-tag>
                                                  </li>
                                                </ul>
                                              </template>

                                              <b-dropdown
                                                text="Add Skill"
                                                style="width: 100%"
                                                menu-class="w-100"
                                                variant="primary"
                                              >
                                                <b-dropdown-form>
                                                  <b-form-group
                                                    label="Search Skill"
                                                    label-for="skill-search"
                                                    @submit.stop.prevent
                                                  >
                                                    <b-form-input
                                                      id="skill-search"
                                                      debounce="500"
                                                      @update="searchSkills"
                                                    />
                                                  </b-form-group>
                                                </b-dropdown-form>
                                                <b-dropdown-divider />
                                                <b-dropdown-item
                                                  v-for="skill in skillOptions"
                                                  :key="skill._id"
                                                  @click="selectJobSkill(skill)"
                                                >
                                                  {{ skill.name }} <span style="color: grey; font-size: 12px">{{ skill.description }}</span>
                                                </b-dropdown-item>
                                              </b-dropdown>
                                            </b-form-tags>
                                          </b-col>

                                          <b-col
                                            cols="12"
                                            md="6"
                                          >
                                            <b-button
                                              class="w-50 mt-3"
                                              @click="showJobForm = false"
                                            >
                                              Cancel
                                            </b-button>
                                          </b-col>

                                          <b-col
                                            cols="12"
                                            md="6"
                                          >
                                            <b-button
                                              class="w-50 mt-3"
                                              variant="success"
                                              :disabled="invalidRole"
                                              @click="addEventJob"
                                            >
                                              Submit
                                            </b-button>
                                          </b-col>
                                        </b-row>
                                      </b-container>
                                    </validation-observer>
                                  </b-card>
                                </b-collapse>
                              </b-col>
                            </b-row>
                          </b-card>
                        </b-col>
                      </b-row>

                      <b-row class="pt-4">
                        <b-col cols="12">
                          <b-card style="border-radius: 20px;">
                            <h5
                              class="text-start"
                              style="font-family:'Bebas Neue', cursive;"
                            >
                              Questionnaire
                            </h5>

                            <b-row class="pt-2">
                              <b-col cols="12">
                                <b-table
                                  :items="event.questions"
                                  :fields="questionFields"
                                  show-empty
                                  responsive
                                  striped
                                  primary-key="index"
                                >
                                  <template #cell(actions)="{ index }">
                                    <b-button
                                      variant="danger"
                                      @click="removeEventQuestion(index)"
                                    >
                                      <b-icon icon="trash" />
                                    </b-button>
                                  </template>
                                </b-table>
                              </b-col>

                              <b-col cols="12">
                                <b-button
                                  class="w-100 mb-3"
                                  :disabled="showQuestionForm"
                                  @click="showQuestionForm = true"
                                >
                                  Add Question
                                </b-button>

                                <b-collapse v-model="showQuestionForm">
                                  <b-card>
                                    <validation-observer
                                      ref="questionObs"
                                      v-slot="{ invalid: invalidQuestion }"
                                    >
                                      <b-container>
                                        <b-row>
                                          <b-col cols="12">
                                            <b-form-group class="text-start">
                                              <label
                                                class="py-1"
                                                for="input-question-label"
                                                style="font-family: 'Bebas Neue', cursive;"
                                              >
                                                Question:
                                              </label>

                                              <validation-provider
                                                v-slot="validationContext"
                                                :rules="{
                                                  required: showQuestionForm === true,
                                                  max: 255
                                                }"
                                              >
                                                <b-form-input
                                                  id="input-question-label"
                                                  v-model="questionForm.label"
                                                  placeholder="Ex: How satisfied are you with the event?"
                                                  :state="getValidationState(validationContext)"
                                                  aria-describedby="input-question-label-feedback"
                                                />

                                                <b-form-invalid-feedback id="input-question-label-feedback">
                                                  {{ validationContext.errors[0] }}
                                                </b-form-invalid-feedback>
                                              </validation-provider>
                                            </b-form-group>
                                          </b-col>

                                          <b-col
                                            cols="12"
                                            md="6"
                                          >
                                            <b-button
                                              class="w-50 mt-3"
                                              @click="showQuestionForm = false"
                                            >
                                              Cancel
                                            </b-button>
                                          </b-col>

                                          <b-col
                                            cols="12"
                                            md="6"
                                          >
                                            <b-button
                                              class="w-50 mt-3"
                                              variant="success"
                                              :disabled="invalidQuestion"
                                              @click="addEventQuestion"
                                            >
                                              Submit
                                            </b-button>
                                          </b-col>
                                        </b-row>
                                      </b-container>
                                    </validation-observer>
                                  </b-card>
                                </b-collapse>
                              </b-col>
                            </b-row>
                          </b-card>
                        </b-col>
                      </b-row>

                      <b-row class="pt-4">
                        <b-col cols="12">
                          <b-card style="border-radius: 20px;">
                            <h5
                              class="text-start"
                              style="font-family:'Bebas Neue', cursive;"
                            >
                              Items Needed for Event
                            </h5>

                            <b-row class="pt-2">
                              <b-col cols="12">
                                <b-table
                                  :items="event.ikdItems"
                                  :fields="ikdFields"
                                  show-empty
                                  responsive
                                  striped
                                  fixed
                                  primary-key="_id"
                                >
                                  <template #cell(quantity)="{ item }">
                                    <b-form-input
                                      v-model="item['quantity']"
                                      class="text-center"
                                      type="number"
                                      style="width: 25%; display: inline"
                                      :formatter="(value) => validateItemQuantity(value, item.maxQuantity)"
                                    /> / {{ item.maxQuantity }}
                                  </template>

                                  <template #cell(actions)="{ index }">
                                    <b-button
                                      variant="danger"
                                      @click="removeIkdItem(index)"
                                    >
                                      <b-icon icon="trash" />
                                    </b-button>
                                  </template>
                                </b-table>
                              </b-col>

                              <b-col cols="12">
                                <b-dropdown
                                  text="Add Item"
                                  style="width: 100%"
                                  menu-class="w-100"
                                  variant="primary"
                                >
                                  <b-dropdown-form>
                                    <b-form-group
                                      label="Search Item"
                                      label-for="item-search"
                                      @submit.stop.prevent
                                    >
                                      <b-form-input
                                        id="item-search"
                                        debounce="500"
                                        @update="searchInkindDonations"
                                      />
                                    </b-form-group>
                                  </b-dropdown-form>
                                  <b-dropdown-divider />
                                  <b-dropdown-item
                                    v-for="item in ikdOptions"
                                    :key="item._id"
                                    @click="selectIkdItem(item)"
                                  >
                                    {{ item.quantity }} - {{ item.name }}
                                    <span style="color: grey; font-size: 12px">{{ item.sku }}</span>&nbsp;
                                    <span
                                      v-if="hasExpiration(item)"
                                      style="color: grey; font-size: 12px"
                                    >
                                      {{
                                        getItemExpirationDate(item).toLocaleString('en-us', { month: 'short', year: 'numeric' })
                                      }}
                                      <b-icon
                                        v-if="isExpiring(getItemExpirationDate(item))"
                                        variant="danger"
                                        icon="exclamation-circle-fill"
                                      />
                                    </span>
                                  </b-dropdown-item>
                                </b-dropdown>
                              </b-col>
                            </b-row>
                          </b-card>
                        </b-col>
                      </b-row>
                    </b-form>

                    <b-row class="py-3">
                      <b-col cols="12">
                        <b-row
                          align-h="end"
                          align-v="center"
                        >
                          <b-col cols="2">
                            <b-button
                              id="create-button"
                              class="w-100"
                              variant="danger"
                              :disabled="(!event.name || !event.location.name) && !(showJobForm || showQuestionForm || budgetForm.show)"
                              @click="() => {
                                if (showJobForm || showQuestionForm || budgetForm.show) {
                                  return
                                }

                                showModal = !showModal
                              }"
                            >
                              <b-icon
                                v-if="showJobForm || showQuestionForm || budgetForm.show"
                                icon="exclamation-triangle"
                                font-scale=".85"
                                style="vertical-align: baseline"
                              />

                              <span v-else>
                                Create
                              </span>
                            </b-button>

                            <b-tooltip
                              :disabled="!(showJobForm || showQuestionForm || budgetForm.show)"
                              target="create-button"
                            >
                              Please complete or close the Roles or Questionnaire form
                            </b-tooltip>
                          </b-col>
                        </b-row>
                      </b-col>
                    </b-row>
                  </div>
                </b-skeleton-wrapper>
              </b-container>
            </validation-observer>
          </b-card>
        </b-col>
      </b-row>
    </b-container>

    <b-modal
      v-model="showModal"
      size="xl"
      @ok="createEvent"
    >
      <b-container fluid>
        <h1 style="font-family:'Bebas Neue', cursive; text-align:center;">
          Are you sure with all the details?
        </h1>
      </b-container>
    </b-modal>
  </div>
</template>

<script>
import { ValidationObserver, ValidationProvider, extend } from 'vee-validate'
import { required, max } from 'vee-validate/dist/rules'
import { mapGetters } from 'vuex'
import {
  addMonths,
  addDays,
  isSameDay
} from 'date-fns'

import formatterMixins from '../../mixins/formatters'

import { apiClient } from '../../axios'
import EventTemplateRepository from '../../repositories/events/templates'
import EventTypeRepository from '../../repositories/events/types'

const eventTemplateRepository = new EventTemplateRepository(apiClient)
const today = new Date()
const nextMonth = addMonths(today, 1)

extend('required', {
  ...required,
  message: 'This field is required'
})
extend('max', {
  ...max,
  message: 'This field must be less than or equal to {length} characters'
})

export default ({
  name: 'EventAdd',
  components: {
    ValidationObserver,
    ValidationProvider
  },
  mixins: [
    formatterMixins
  ],
  data () {
    return {
      eventTypeRepository: null,
      isFetchingTemplate: false,
      isUrgentEvent: false,
      minStartDate: nextMonth,
      startDate: {
        date: nextMonth,
        time: '00:00'
      },
      endDate: {
        date: nextMonth,
        time: '01:00'
      },
      event: {
        name: '',
        type: '',
        description: '',
        location: {
          name: ''
        },
        date: {
          start: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), nextMonth.getDate(), 0, 0, 0, 0),
          end: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), nextMonth.getDate(), 1, 0, 0, 0)
        },
        goals: {
          monetaryDonation: '0.00'
        },
        contacts: [],
        logo: null,
        sdgIds: [],
        ikdItems: [],
        jobs: [],
        questions: [],
        saveAsTemplate: false,
        templateName: '',
        templateDescription: '',
        budget: {
          breakdown: []
        }
      },
      contactForm: {
        name: '',
        contactMethods: [{
          type: 'EMAIL',
          value: ''
        }]
      },
      displayLogo: '',
      showModal: false,
      roles: [],
      search: '',
      value: [],
      eventTypeOptions: [],
      sdgOptions: [],
      ikdFields: [
        { key: 'name', label: 'Item' },
        { key: 'quantity', label: 'Quantity' },
        { key: 'actions', label: 'Actions' }
      ],
      ikdOptions: [],
      jobFields: [
        { key: 'name', label: 'Title' },
        { key: 'description', label: 'Description' },
        { key: 'requirements.max', label: 'Number of Volunteers Needed' },
        { key: 'skills', label: 'Skills' },
        { key: 'actions', label: 'Actions' }
      ],
      showJobForm: false,
      jobForm: {
        name: '',
        description: '',
        requirements: {
          max: 1
        },
        skills: []
      },
      questionFields: [
        { key: 'label', label: 'Question' },
        { key: 'actions', label: 'Actions' }
      ],
      showQuestionForm: false,
      questionForm: {
        label: ''
      },
      budgetForm: {
        show: false,
        details: {
          type: '',
          amount: 1
        }
      },
      skillOptions: []
    }
  },
  computed: {
    ...mapGetters(['token']),
    eventTemplateId () {
      return this.$route.query.templateId
    }
  },
  watch: {
    isUrgentEvent (value) {
      if (!value) {
        this.minStartDate = nextMonth

        if (new Date(this.startDate.date) < nextMonth) {
          this.startDate.date = nextMonth
        }

        return
      }

      this.minStartDate = today
    },
    'event.logo' (value) {
      const reader = new FileReader()

      reader.onload = (e) => {
        this.displayLogo = e.target.result
      }

      reader.readAsDataURL(value)
    },
    'startDate.date' (value) {
      const startDate = new Date(value)

      this.setEventStartDate(startDate, this.startDate.time)

      const endDate = new Date(this.endDate.date)

      if (endDate < startDate) {
        this.endDate.date = value
      }
    },
    'startDate.time' (value) {
      const startDate = new Date(this.startDate.date)
      const endDate = new Date(this.endDate.date)

      this.setEventStartDate(startDate, value)

      if (!isSameDay(startDate, endDate)) {
        return
      }

      const startTimeParts = value.split(':')
      const startHours = Number(startTimeParts[0])
      const startMinutes = Number(startTimeParts[1])

      const endTimeParts = this.endDate.time.split(':')
      const endHours = Number(endTimeParts[0])

      if (startHours >= endHours) {
        const addedHours = startHours + 1
        let hours = addedHours.toString().padStart(2, '0')

        if (addedHours > 23) {
          hours = '00'

          this.endDate.date = addDays(endDate, 1)
        }

        const minutes = startMinutes.toString().padStart(2, '0')

        this.endDate.time = `${hours}:${minutes}:00`
      }
    },
    'endDate.date' (value) {
      this.setEventEndDate(new Date(value), this.endDate.time)
    },
    'endDate.time' (value) {
      this.setEventEndDate(new Date(this.endDate.date), value)
    }
  },
  async created () {
    this.eventTypeRepository = new EventTypeRepository(apiClient, {
      bearerToken: this.token
    })

    eventTemplateRepository.setAuthorizationHeader(`Bearer ${this.token}`)

    await this.loadEventTypes()

    await this.fetchAndLoadTemplate()
    await this.getSdgs()
  },
  methods: {
    async fetchAndLoadTemplate () {
      if (!this.eventTemplateId) {
        return
      }

      const eventTemplateId = this.eventTemplateId

      this.isFetchingTemplate = true

      try {
        const eventTemplate = await eventTemplateRepository.get(eventTemplateId)

        if (eventTemplate.location?.name) {
          this.event.location.name = eventTemplate.location.name
        }

        if (eventTemplate.goals?.monetaryDonation) {
          this.event.goals.monetaryDonation = this.toCurrency(eventTemplate.goals.monetaryDonation)
        }

        if (Array.isArray(eventTemplate.sdgIds)) {
          this.event.sdgIds = eventTemplate.sdgIds
        }

        if (Array.isArray(eventTemplate.questions)) {
          this.event.questions = eventTemplate.questions
        }

        if (Array.isArray(eventTemplate.jobs)) {
          this.event.jobs = eventTemplate.jobs
        }
      } catch (_) {
      } finally {
        this.isFetchingTemplate = false
      }
    },
    async loadEventTypes () {
      /** @type {EventTypeRepository} */
      const eventTypeRepository = this.eventTypeRepository

      const { results } = await eventTypeRepository.list({
        sort: {
          field: 'label',
          order: 'asc'
        }
      })

      if (results.length > 0) {
        this.eventTypeOptions = results
        this.event.type = results[0].label
      }
    },
    getValidationState ({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null
    },
    async createEvent () {
      const event = this.event

      const form = new FormData()

      form.set('name', event.name)
      form.set('type', event.type)
      form.set('description', event.description)
      form.set('location[name]', event.location.name)
      form.set('date[start]', new Date(event.date.start).toISOString())
      form.set('date[end]', new Date(event.date.end).toISOString())
      form.set('goals[monetaryDonation]', this.fromCurrencyToNumber(event.goals.monetaryDonation))

      if (event.saveAsTemplate === true) {
        form.set('templateName', event.templateName)
        form.set('templateDescription', event.templateDescription)
        form.set('saveAsTemplate', event.saveAsTemplate)
      }

      if (event.logo !== null) {
        form.set('logo', event.logo)
      }

      if (event.sdgIds.length > 0) {
        for (const id of event.sdgIds) {
          form.append('sdgIds[]', id)
        }
      }

      if (event.ikdItems.length > 0) {
        for (let i = 0; i < event.ikdItems.length; i++) {
          const ikdItem = event.ikdItems[i]

          form.set(`ikdItems[${i}][ikdId]`, ikdItem._id)
          form.set(`ikdItems[${i}][quantity]`, ikdItem.quantity)
        }
      }

      if (event.jobs.length > 0) {
        for (let i = 0; i < event.jobs.length; i++) {
          const job = event.jobs[i]

          form.set(`jobs[${i}][name]`, job.name)
          form.set(`jobs[${i}][description]`, job.description)
          form.set(`jobs[${i}][requirements][max]`, job.requirements.max)

          for (let j = 0; j < job.skills.length; j++) {
            const skill = job.skills[j]

            form.set(`jobs[${i}][skillIds][${j}]`, skill._id)
          }
        }
      }

      if (event.contacts.length > 0) {
        for (let i = 0; i < event.contacts.length; i++) {
          const contact = event.contacts[i]

          form.set(`contacts[${i}][name]`, contact.name)
          form.set(`contacts[${i}][contactMethods][0][type]`, contact.contactMethods[0].type)
          form.set(`contacts[${i}][contactMethods][0][value]`, contact.contactMethods[0].value)
        }
      }

      if (event.questions.length > 0) {
        for (let i = 0; i < event.questions.length; i++) {
          const question = event.questions[i]

          form.set(`questions[${i}][label]`, question.label)
          form.set(`questions[${i}][type]`, question.type)
        }
      }

      if (event.budget.breakdown.length > 0) {
        const budgetBreakdown = event.budget.breakdown

        for (let i = 0; i < budgetBreakdown.length; i++) {
          const breakdownItem = budgetBreakdown[i]

          form.set(`budget[breakdown][${i}][type]`, breakdownItem.type)
          form.set(`budget[breakdown][${i}][amount]`, breakdownItem.amount)
        }
      }

      const results = await apiClient.post('/events', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          authorization: `Bearer ${this.token}`
        }
      })

      const { _id } = results.data

      this.$router.push({
        path: `/events/${_id}`
      })
    },
    addRole () {
      this.roles.push({
        name: this.form.roleName,
        description: this.form.roleDescription,
        max: this.form.roleNumber
      })

      this.form.roleName = ''
      this.form.roleDescription = ''
      this.form.roleNumber = ''
    },
    setEventStartDate (date, time) {
      const year = date.getFullYear()
      const month = date.getMonth()
      const day = date.getDate()

      const [hours, minutes] = time.split(':')

      this.event.date.start = new Date(year, month, day, hours, minutes, 0, 0)
    },
    setEventEndDate (date, time) {
      const year = date.getFullYear()
      const month = date.getMonth()
      const day = date.getDate()

      const [hours, minutes] = time.split(':')

      this.event.date.end = new Date(year, month, day, hours, minutes, 0, 0)
    },
    validatePositive (value) {
      const parsedValue = parseInt(value)

      return isNaN(parsedValue) || parsedValue <= 0 ? 1 : parsedValue
    },
    async getSdgs () {
      const { data } = await apiClient.get('/sdgs', {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      })

      this.sdgOptions = data.results
    },
    async searchInkindDonations (value) {
      const queryString = new URLSearchParams()

      queryString.set('limit', 10)

      if (value !== undefined && value !== '') {
        queryString.set('filters.query', value)
      }

      const { data } = await apiClient.get(`/inkind-donations?${queryString.toString()}`, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      })

      this.ikdOptions = data.results.filter((item) => item.quantity > 0)
    },
    selectIkdItem (item) {
      const itemIndex = this.event.ikdItems.findIndex((ikd) => ikd._id === item._id)

      if (itemIndex !== -1) {
        return
      }

      this.event.ikdItems.push({
        _id: item._id,
        name: item.name,
        quantity: 1,
        maxQuantity: item.quantity
      })
    },
    removeIkdItem (index) {
      this.event.ikdItems.splice(index, 1)
    },
    validateItemQuantity (value, maxQuantity) {
      const parsedNumber = Number(value)

      if (isNaN(parsedNumber) || parsedNumber < 1) {
        return 1
      }

      if (parsedNumber > maxQuantity) {
        return 1
      }

      return parsedNumber
    },
    addEventContact () {
      if (this.contactForm.name !== '' && this.contactForm.contactMethods[0].value !== '') {
        this.event.contacts.push(this.contactForm)
      }

      this.contactForm = {
        name: '',
        contactMethods: [{
          type: 'EMAIL',
          value: ''
        }]
      }

      this.$refs.eventContactFormDropdown.hide(true)
    },
    removeEventContact (index) {
      this.event.contacts.splice(index, 1)
    },
    async searchSkills (value) {
      const queryString = new URLSearchParams()

      queryString.set('limit', 10)

      if (value !== undefined && value !== '') {
        queryString.set('filters.name', value)
      }

      const { data } = await apiClient.get(`/skills?${queryString.toString()}`, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      })

      this.skillOptions = data.results
    },
    selectJobSkill (skill) {
      const skillIndex = this.jobForm.skills.findIndex((jobSkill) => jobSkill._id === skill._id)

      if (skillIndex !== -1) {
        return
      }

      this.jobForm.skills.push({
        _id: skill._id,
        name: skill.name,
        description: skill.description
      })
    },
    removeJobSkill (index) {
      this.jobForm.skills.splice(index, 1)
    },
    addEventJob () {
      const {
        name,
        description,
        requirements,
        skills
      } = this.jobForm

      this.event.jobs.push({
        name,
        description,
        requirements,
        skills
      })

      this.showJobForm = false

      this.jobForm = {
        name: '',
        description: '',
        requirements: {
          max: 1
        },
        skills: []
      }
    },
    removeEventJob (index) {
      this.event.jobs.splice(index, 1)
    },
    addEventQuestion () {
      const { label } = this.questionForm

      if (label !== undefined && label.trim() !== '') {
        this.event.questions.push({
          label,
          type: 'matrix'
        })
      }

      this.showQuestionForm = false

      this.questionForm = {
        label: ''
      }
    },
    removeEventQuestion (index) {
      this.event.questions.splice(index, 1)
    },
    hasExpiration (item) {
      if (item.category === undefined || item.category.customFields === undefined) {
        return false
      }

      return item.category.customFields.bestBeforeDate !== undefined || item.category.customFields.expirationDate !== undefined
    },
    getItemExpirationDate (item) {
      if (item.category.customFields.expirationDate !== undefined) {
        return new Date(item.category.customFields.expirationDate)
      }

      if (item.category.customFields.bestBeforeDate !== undefined) {
        return new Date(item.category.customFields.bestBeforeDate)
      }
    },
    isExpiring (date) {
      const todayAfterOneMonth = addMonths(new Date(), 1)

      return date <= todayAfterOneMonth
    },
    addToBudgetBreakdown () {
      const { type, amount } = this.budgetForm.details

      this.event.budget.breakdown.push({
        type,
        amount: this.fromCurrencyToNumber(amount)
      })

      this.$refs.budgetObs.reset()
      this.budgetForm.show = false
      this.budgetForm.details = {
        type: '',
        amount: 1
      }
    },
    removeFromBudget (index) {
      this.event.budget.breakdown.splice(index, 1)
    }
  }
})
</script>

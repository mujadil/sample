import { LightningElement, track } from 'lwc';
import getSObjects from '@salesforce/apex/ObjectFieldController.getSObjects';
import getFields from '@salesforce/apex/ObjectFieldController.getFields';
import getRecords from '@salesforce/apex/ObjectFieldController.getRecords';

export default class ObjectFieldSelector extends LightningElement {
    @track objectOptions = [];
    @track fieldOptions = [];
    @track selectedObject = '';
    @track selectedFields = [];
    @track whereClause = '';
    @track records = [];
    @track isLoading = false;
    @track showRecords = false;

    connectedCallback() {
        this.fetchObjects();
    }

    fetchObjects() {
        this.isLoading = true;
        getSObjects()
            .then(result => {
                this.objectOptions = result.map(obj => ({ label: obj, value: obj }));
                this.isLoading = false;
            })
            .catch(error => {
                console.error('Error fetching objects:', error);
                this.isLoading = false;
            });
    }

    handleObjectChange(event) {
        this.selectedObject = event.target.value;
        this.fetchFields();
    }

    fetchFields() {
        this.isLoading = true;
        getFields({ sObjectName: this.selectedObject })
            .then(result => {
                this.fieldOptions = result.map(field => ({ label: field, value: field }));
                this.isLoading = false;
            })
            .catch(error => {
                console.error('Error fetching fields:', error);
                this.isLoading = false;
            });
    }

    handleFieldChange(event) {
        this.selectedFields = event.detail.value;
    }

    handleWhereClauseChange(event) {
        this.whereClause = event.target.value;
    }

    fetchRecords() {
        if (this.selectedFields.length > 0) {
            this.isLoading = true;
            getRecords({
                sObjectName: this.selectedObject,
                fieldNames: this.selectedFields,
                whereClause: this.whereClause
            })
                .then(result => {
                    const baseUrl = window.location.origin; // Base URL of your Salesforce org
                    this.records = result.map(record => ({
                        id: record.Id,
                        titleFieldValue: record[this.selectedFields[0]], // Use the first selected field as the title
                        url: `${baseUrl}/lightning/r/${this.selectedObject}/${record.Id}/view`, // Construct Lightning URL
                        fields: this.selectedFields.map(field => ({
                            name: field,
                            value: record[field]
                        }))
                    }));
                    this.showRecords = true;
                    this.isLoading = false;
                })
                .catch(error => {
                    console.error('Error fetching records:', error);
                    this.isLoading = false;
                });
        } else {
            alert('Please select at least one field.');
        }
    }

    handleBack() {
        this.showRecords = false;
        this.records = [];
    }
}

<?php
App::uses('AppModel', 'Model');

/**
 * Address Model
 *
 * @property User         User
 * @property AddressGroup AddressGroup
 */
class Address extends AppModel
{
    public $belongsTo = array('User');
    public $hasAndBelongsToMany = array(
        'AddressGroup' => array(
            'className' => 'AddressGroup',
            'joinTable' => 'addresses_groups',
            'unique'    => 'keepExisting',
        ),
    );

    public $errorMessage = '';

    private $fieldsForImport = array(
        'linked'  => array(
            'first name'     => 'first_name',
            'last name'      => 'last_name',
            'e-mail address' => 'email',
            'business phone' => 'phone',
            'company'        => 'company',
            'job title'      => 'job_title',
        ),
        'outlook' => array(
            'first name'              => 'first_name',
            'last name'               => 'last_name',
            'company'                 => 'company',
            'job title'               => 'job_title',
            'business street'         => 'address',
            'business street 2'       => 'address2',
            'business street 3'       => 'address3',
            'business city'           => 'address4',
            'business state'          => 'address5',
            'business postal code'    => 'address6',
            'business country/region' => 'address7',
            'business phone'          => 'phone',
            'e-mail address'          => 'email',
            'notes'                   => 'notes',
            'web page'                => 'url',
        ),
        'apple'   => array(
            'first'     => 'first_name',
            'last'      => 'last_name',
            'job title' => 'job_title',
            'company'   => 'company',
            'e-mail'    => 'email',
            'phone'     => 'phone',
        ),
        'gmail'   => array(
            'first name'              => 'first_name',
            'last name'               => 'last_name',
            'company'                 => 'company',
            'job title'               => 'job_title',
            'business street'         => 'address',
            'business street 2'       => 'address2',
            'business street 3'       => 'address3',
            'business city'           => 'address4',
            'business state'          => 'address5',
            'business postal code'    => 'address6',
            'business country/region' => 'address7',
            'business phone'          => 'phone',
            'e-mail address'          => 'email',
            'notes'                   => 'notes',
            'web page'                => 'url',
        ),
        'other'   => array(
            'url'        => 'url',
            'notes'      => 'notes',
            'phone'      => 'phone',
            'company'    => 'company',
            'last_name'  => 'last_name',
            'job_title'  => 'job_title',
            'first_name' => 'first_name',
            'email'      => 'email',
        ),
    );

    public function getByGroup($groupId = null)
    {
        $options = array(
            'conditions' => array(
                'Address.address_group_id' => $groupId
            )
        );

        $data = $this->find('all', $options);

        return Set::extract('/Address/.', $data);
    }

    public function getById($contactId)
    {
        $options = array(
            'conditions' => array(
                'Address.id' => $contactId
            ),
            'contain'    => array(
                'AddressGroup' => array(
                    'fields' => array('AddressGroup.title')
                )
            )
        );

        $data = $this->find('first', $options);

        return $data;
    }

    public function importFromCSV($userID, $pathToFile, $provider)
    {
        $data = array();

        if (file_exists($pathToFile)) {
            if (strtolower(pathinfo($pathToFile)['extension']) !== 'csv') {
                $this->errorMessage = 'Please provide CSV file.';
                return false;
            }

            $fileStream = fopen($pathToFile, "r");

            $data = array();

            $fieldsForImport = array_keys($this->fieldsForImport[$provider]);
            $existFieldNamesForTable = array();

            $existFields = array_filter(fgetcsv($fileStream), function ($var) use ($fieldsForImport, &$existFieldNamesForTable, $provider) {
                if ($inArray = in_array(strtolower($var), $fieldsForImport)) {
                    $existFieldNamesForTable[] = $this->fieldsForImport[$provider][strtolower($var)];
                }

                return $inArray;
            });

            while (($row = fgetcsv($fileStream)) !== false && count($row) > count($existFields)) {
                static $i = 0;
                $values = array_intersect_key($row, $existFields);
                //***************************************************************
                // Used this section code instead of array_intersect function
                $_data = [];
                foreach ($existFields as $key => $value) {
                    $_data[] = isset($values[$key]) ? $values[$key] : '';
                }
                //***************************************************************
                $data[$i] = array_combine($existFieldNamesForTable, $_data);
                if (in_array($provider, array('gmail', 'outlook'))) {
                    $data[$i]['address'] = implode(', ', array(
                        isset($data[$i]['address2']) ? $data[$i]['address2'] : '',
                        isset($data[$i]['address3']) ? $data[$i]['address3'] : '',
                        isset($data[$i]['address4']) ? $data[$i]['address4'] : '',
                        isset($data[$i]['address5']) ? $data[$i]['address5'] : '',
                        isset($data[$i]['address6']) ? $data[$i]['address6'] : '',
                        isset($data[$i]['address7']) ? $data[$i]['address7'] : ''));
                }
                $data[$i]['user_id'] = $userID;
                $data[$i]['imported'] = true;
                // Clear non symbolic in fields
                array_walk($data[$i], function (&$value) {
                    $value = preg_replace('/[^\x20-\x7E]/', '', $value);
                });
                $i++;
            }
        }

        foreach ($data as $key => $val) {
            if (empty($val['first_name']) && empty($val['last_name'])) {
                unset($data[$key]);
            }
        }
        if ($data && $this->saveMany($data)) {
            $result = $this->find('all', array('conditions' => array('user_id' => $userID)));
            return Set::extract('/Address/.', $result);
        }

        $this->errorMessage = 'There is no contacts in Your CSV file or structure not right.';

        return false;
    }
}
